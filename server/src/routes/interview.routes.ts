import express from 'express';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import retellService from '../services/retell.service.js';
import n8nService from '../services/n8n.service.js';
import aiService from '../services/ai.service.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3 } from '../config/s3.js';

const router = express.Router();

// Validate interview code (public endpoint)
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, error: 'Code is required' });
    }

    const candidate = await Candidate.findOne({
      interviewCode: code.toUpperCase(),
    });

    if (!candidate) {
      return res.status(404).json({ valid: false, error: 'Invalid code' });
    }

    // Check if code is expired
    if (new Date() > candidate.interviewCodeExpiry) {
      candidate.interviewStatus = 'expired';
      await candidate.save();
      return res.status(400).json({ valid: false, error: 'Code expired' });
    }

    // Check if interview already completed
    if (candidate.hasAccessedInterview && candidate.interviewStatus === 'completed') {
      return res.status(400).json({ 
        valid: false, 
        error: 'Interview already completed' 
      });
    }

    // Mark as accessed on first validation
    if (!candidate.hasAccessedInterview) {
      candidate.hasAccessedInterview = true;
      candidate.interviewStatus = 'in_progress';
      candidate.interviewStartedAt = new Date();
      candidate.interviewAttempts += 1;
      await candidate.save();
    }

    res.json({
      valid: true,
      candidate_name: `${candidate.firstName} ${candidate.lastName}`,
      uid: candidate._id.toString(),
    });
  } catch (error: any) {
    console.error('Validate code error:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// Create Retell web call (public endpoint for interview page)
router.post('/create-web-call', async (req, res) => {
  try {
    const { agentId } = req.body;
    const callData = await retellService.createWebCall(agentId);
    
    res.json(callData);
  } catch (error: any) {
    console.error('Create web call error:', error);
    res.status(500).json({ error: 'Failed to create interview session' });
  }
});

// Save interview recording (public endpoint)
router.post('/save-recording', upload.single('file'), async (req, res) => {
  try {
    const { candidate_name, uid } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!uid) {
      return res.status(400).json({ error: 'Candidate UID required' });
    }

    console.log(`Uploading recording for candidate ${uid}, size: ${file.size} bytes`);

    // Upload to S3
    const uploadResult = await uploadToS3(
      file.buffer,
      process.env.AWS_S3_RECORDINGS_FOLDER || 'recordings',
      file.originalname,
      file.mimetype
    );

    // Update candidate record
    const candidate = await Candidate.findById(uid);
    if (candidate) {
      candidate.recordingUrl = uploadResult.url;
      candidate.recordingS3Key = uploadResult.key;
      await candidate.save();
      
      console.log(`✅ Recording saved for candidate ${uid}`);
    }

    res.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
    });
  } catch (error: any) {
    console.error('Save recording error:', error);
    res.status(500).json({ error: 'Failed to save recording' });
  }
});

// Submit interview results (public endpoint)
router.post('/submit-result', async (req, res) => {
  try {
    const { candidateId, transcript, duration, metadata } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID required' });
    }

    const candidate = await Candidate.findById(candidateId).populate('jobId');
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate with transcript
    candidate.transcript = transcript || [];
    candidate.interviewStatus = 'completed';
    candidate.interviewCompletedAt = new Date();
    await candidate.save();

    // Get job details for analysis
    const job = await Job.findById(candidate.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Analyze interview with AI
    try {
      const analysis = await aiService.analyzeInterview(
        candidate.transcript,
        job.description,
        job.requiredSkills
      );

      candidate.analysis = analysis;
      await candidate.save();

      console.log(`✅ Interview analyzed for candidate ${candidateId}`);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue even if AI analysis fails
    }

    // Send result to n8n webhook for further processing
    try {
      await n8nService.sendInterviewResult({
        candidateId: candidate._id.toString(),
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        interviewData: metadata || {},
        transcript: candidate.transcript,
        duration: duration || 0,
        recordingUrl: candidate.recordingUrl,
      });
    } catch (n8nError) {
      console.error('n8n webhook failed:', n8nError);
      // Continue even if webhook fails
    }

    res.json({
      success: true,
      message: 'Interview results submitted successfully',
      analysis: candidate.analysis,
    });
  } catch (error: any) {
    console.error('Submit result error:', error);
    res.status(500).json({ error: 'Failed to submit interview results' });
  }
});

export default router;
