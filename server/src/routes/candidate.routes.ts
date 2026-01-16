import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CandidateResult } from '../models/CandidateResult.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3 } from '../config/s3.js';
import n8nService from '../services/n8n.service.js';

const router = express.Router();

// Generate unique interview code
const generateInterviewCode = (): string => {
  return uuidv4().substring(0, 8).toUpperCase().replace(/-/g, '');
};

// Upload resume and create candidate (protected)
router.post('/upload-resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { jobId } = req.body;

    // Validate jobId is provided
    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    let resumeUrl = '';
    let resumeS3Key = '';

    // Try to upload to S3, fallback to local storage if it fails
    try {
      const uploadResult = await uploadToS3(
        file.buffer,
        process.env.AWS_S3_RESUMES_FOLDER || 'resumes',
        `temp_${Date.now()}_${file.originalname}`,
        file.mimetype
      );
      resumeUrl = uploadResult.url;
      resumeS3Key = uploadResult.key;
    } catch (s3Error) {
      console.warn('⚠️  S3 upload failed, using local storage:', s3Error);
      // Store file info locally (in production, you'd save to local filesystem)
      resumeUrl = `/uploads/resumes/${file.originalname}`;
      resumeS3Key = `local_${Date.now()}_${file.originalname}`;
    }

    // TODO: Parse resume using AI service to extract candidate info
    // For now, extract name from filename (basic parsing)
    const fileName = file.originalname.replace(/\.[^/.]+$/, '');
    const nameParts = fileName.split(/[-_\s]+/);
    const candidateData = {
      firstName: nameParts[0] || 'Unknown',
      lastName: nameParts.slice(1).join(' ') || 'Candidate',
      email: null, // TODO: Extract email from resume text
      phone: null
    };

    const firstName = candidateData.firstName || 'Unknown';
    const lastName = candidateData.lastName || 'Candidate';
    const email = candidateData.email;

    // Check if candidate already exists by email (if email was extracted)
    let candidate;
    if (email) {
      candidate = await Candidate.findOne({ email, jobId });
      
      if (candidate) {
        console.log(`📧 Existing candidate found: ${email}, updating resume`);
        
        // Update existing candidate with new resume
        candidate.resumeUrl = resumeUrl;
        candidate.resumeS3Key = resumeS3Key;
        candidate.firstName = firstName;
        candidate.lastName = lastName;
        
        // Update phone if parsed
        if (candidateData.phone) {
          candidate.phone = candidateData.phone;
        }
        
        await candidate.save();
        
        return res.status(200).json({
          success: true,
          candidate,
          message: 'Existing candidate updated with new resume',
          isExisting: true
        });
      }
    }

    // Generate interview code
    const interviewCode = generateInterviewCode();
    const expiryHours = parseInt(process.env.INTERVIEW_CODE_EXPIRY_HOURS || '168');
    const interviewCodeExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // Create new candidate with resume
    candidate = new Candidate({
      firstName,
      lastName,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@pending.com`, // Placeholder if no email
      phone: candidateData.phone || '',
      jobId,
      resumeUrl,
      resumeS3Key,
      interviewCode,
      interviewCodeExpiry,
      interviewStatus: email ? 'pending' : 'pending', // Use 'pending' - admin needs to add email manually
      createdBy: (req as any).user.id,
    });

    await candidate.save();

    // Send email notification via N8N if email exists
    if (email) {
      try {
        const interviewLink = `${process.env.FRONTEND_URL}/interview?code=${interviewCode}`;
        
        await n8nService.sendInvitationEmail(
          email,
          `${firstName} ${lastName}`,
          interviewLink,
          interviewCode,
          job.title
        );
        
        console.log(`✅ Email sent to ${email} via N8N webhook`);
      } catch (emailError) {
        console.error('⚠️  Failed to send email via N8N:', emailError);
        // Continue even if email fails
      }
    }

    res.status(201).json({
      success: true,
      candidate,
      message: email ? 'Resume uploaded, candidate created, and email sent' : 'Resume uploaded, please add candidate email manually',
      isExisting: false
    });
  } catch (error: any) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get all candidates (protected)
router.get('/', authenticate, async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });

    // Fetch all candidate results
    const results = await CandidateResult.find({});

    // Map results to candidates (fuzzy match by name)
    const candidatesWithResults = candidates.map((candidate) => {
      const candidateObj = candidate.toObject();
      const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
      
      const result = results.find((r: any) => {
        const rName = r.candidateInformation?.fullName?.toLowerCase();
        return rName && (rName.includes(fullName) || fullName.includes(rName));
      });

      if (result) {
        (candidateObj as any).interviewAnalysis = result;
        // Ensure status reflects readiness
        (candidateObj as any).status = 'ai_analysis_ready'; 
      }

      return candidateObj;
    });

    res.json(candidatesWithResults);
  } catch (error: any) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get candidate by ID (protected)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId')
      .populate('createdBy', 'firstName lastName email');

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Fetch matching result using fuzzy search on name
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
    
    // Find matching result in candidate_result collection
    // We try to match by name since we might not have a direct link yet
    const results = await CandidateResult.find({
      'candidateInformation.fullName': { $exists: true }
    });

    const result = results.find(r => {
      const rName = r.candidateInformation?.fullName?.toLowerCase();
      return rName && (rName.includes(fullName) || fullName.includes(rName));
    });

    const candidateObj = candidate.toObject();
    if (result) {
      (candidateObj as any).interviewAnalysis = result;
    }

    res.json(candidateObj);
  } catch (error: any) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Create candidate and send invitation (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, jobId, linkedInUrl } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !jobId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if candidate already exists for this job
    const existingCandidate = await Candidate.findOne({ email, jobId });
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate already invited for this job' });
    }

    // Generate interview code
    const interviewCode = generateInterviewCode();
    const expiryHours = parseInt(process.env.INTERVIEW_CODE_EXPIRY_HOURS || '168');
    const interviewCodeExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // Create candidate
    const candidate = new Candidate({
      firstName,
      lastName,
      email,
      phone,
      jobId,
      linkedInUrl,
      interviewCode,
      interviewCodeExpiry,
      interviewStatus: 'invited',
      createdBy: (req as any).user.id,
    });

    await candidate.save();

    // Generate interview link
    const interviewLink = `${process.env.FRONTEND_URL}/interview?code=${interviewCode}`;


    if (!req.body.skipInvite) {
      // Send invitation email via n8n
      try {
        await n8nService.sendInvitationEmail(
          email,
          `${firstName} ${lastName}`,
          interviewLink,
          interviewCode,
          job.title
        );
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Continue even if email fails
      }
    }

    res.status(201).json({
      candidate,
      interviewLink,
      message: req.body.skipInvite
        ? 'Candidate created successfully'
        : 'Candidate created and invitation sent',
    });
  } catch (error: any) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Upload candidate resume (protected)
router.post('/:id/resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3
    const uploadResult = await uploadToS3(
      file.buffer,
      process.env.AWS_S3_RESUMES_FOLDER || 'resumes',
      `${candidate._id}_${file.originalname}`,
      file.mimetype
    );

    candidate.resumeUrl = uploadResult.url;
    candidate.resumeS3Key = uploadResult.key;
    await candidate.save();

    res.json({
      success: true,
      resumeUrl: uploadResult.url,
    });
  } catch (error: any) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Update candidate decision (protected)
router.patch('/:id/decision', authenticate, async (req, res) => {
  try {
    const { finalDecision, notes } = req.body;

    if (!['hired', 'rejected', 'pending'].includes(finalDecision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { finalDecision, notes },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error: any) {
    console.error('Update decision error:', error);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

// Resend invitation (temporarily public for testing - TODO: add auth back)
router.post('/:id/resend-invitation', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobId');
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const { firstName, lastName, email, subject, message } = req.body;

    // Update candidate details if provided
    if (firstName) candidate.firstName = firstName;
    if (lastName) candidate.lastName = lastName;
    if (email) candidate.email = email;
    
    // Generate new code if expired
    if (candidate.interviewCodeExpiry && new Date() > candidate.interviewCodeExpiry) {
      candidate.interviewCode = generateInterviewCode();
      const expiryHours = parseInt(process.env.INTERVIEW_CODE_EXPIRY_HOURS || '168');
      candidate.interviewCodeExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
      candidate.interviewStatus = 'invited';
    }
    
    await candidate.save();

    const job = candidate.jobId as any;
    const interviewLink = `${process.env.FRONTEND_URL}/interview?code=${candidate.interviewCode}`;

    await n8nService.sendInvitationEmail(
      candidate.email,
      `${candidate.firstName} ${candidate.lastName}`,
      interviewLink,
      candidate.interviewCode || 'ERROR',
      job.title,
      subject,
      message
    );

    res.json({ message: 'Invitation resent successfully' });
  } catch (error: any) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
});

// Delete candidate (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Note: We are NOT deleting the associated Job or generated Questions, as per requirements.
    // If we wanted to clean up S3 files (resume, recording), we would do it here.

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error: any) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;
