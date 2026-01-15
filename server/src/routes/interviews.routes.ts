import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Interview } from '../models/Interview.js';
import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { Evaluation } from '../models/Evaluation.js';
import { Company } from '../models/Company.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadRecording } from '../middleware/upload.js';
import { s3Service, n8nService, aiService } from '../services/index.js';

const router = Router();

/**
 * POST /api/interviews/validate-code
 * Validate interview code (public endpoint for candidates)
 */
router.post(
  '/validate-code',
  [body('code').trim().notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ valid: false, errors: errors.array() });
        return;
      }

      const { code } = req.body;

      const interview = await Interview.findOne({
        'invitation.code': code.toUpperCase(),
      }).populate('candidateId');

      if (!interview) {
        res.json({ valid: false, message: 'Invalid code' });
        return;
      }

      // Check if expired
      if (new Date() > interview.invitation.expiresAt) {
        interview.status = 'expired';
        await interview.save();
        res.json({ valid: false, message: 'Interview code has expired' });
        return;
      }

      // Check if already used/completed
      if (interview.invitation.isUsed || interview.status === 'completed') {
        res.json({ valid: false, message: 'Interview has already been completed' });
        return;
      }

      // Check if cancelled
      if (interview.status === 'cancelled') {
        res.json({ valid: false, message: 'Interview has been cancelled' });
        return;
      }

      const candidate = interview.candidateId as unknown as { firstName: string; lastName: string; _id: string };

      res.json({
        valid: true,
        candidate_name: `${candidate.firstName} ${candidate.lastName}`,
        uid: candidate._id.toString(),
        interviewId: interview._id.toString(),
      });
    } catch (error) {
      console.error('Validate code error:', error);
      res.status(500).json({ valid: false, error: 'Validation failed' });
    }
  }
);

/**
 * POST /api/interviews/:id/start
 * Start interview session (called when candidate begins)
 */
router.post('/start/:code', async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findOne({
      'invitation.code': req.params.code.toUpperCase(),
    });

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    if (interview.invitation.isUsed) {
      res.status(400).json({ error: 'Interview has already been started' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ error: 'Interview has already been completed' });
      return;
    }

    // Mark as started
    interview.invitation.isUsed = true;
    interview.status = 'in_progress';
    interview.startedAt = new Date();
    interview.browserInfo = req.body.browserInfo || {};
    interview.ipAddress = req.ip || req.socket.remoteAddress;

    await interview.save();

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidateId, {
      status: 'interview_in_progress',
    });

    res.json({
      message: 'Interview started',
      interviewId: interview._id,
      startedAt: interview.startedAt,
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

/**
 * POST /api/interviews/:id/transcript
 * Add transcript entry
 */
router.post(
  '/:id/transcript',
  [
    body('speaker').isIn(['ai', 'candidate']),
    body('text').trim().notEmpty(),
    body('timestamp').isNumeric(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const interview = await Interview.findById(req.params.id);

      if (!interview) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      const { speaker, text, timestamp, questionId } = req.body;

      interview.transcript.push({
        speaker,
        text,
        timestamp,
        questionId,
      });

      await interview.save();

      res.json({ message: 'Transcript entry added' });
    } catch (error) {
      console.error('Add transcript error:', error);
      res.status(500).json({ error: 'Failed to add transcript' });
    }
  }
);

/**
 * POST /api/interviews/:id/recording
 * Upload interview recording
 */
router.post('/:id/recording', uploadRecording, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No recording uploaded' });
      return;
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Upload to S3
    const uploadResult = await s3Service.uploadRecording(
      req.file.buffer,
      interview.candidateId.toString(),
      req.file.originalname
    );

    // Update interview with recording URL
    interview.fullRecordingUrl = uploadResult.url;
    interview.recordings.push({
      videoUrl: uploadResult.url,
      duration: parseInt(req.body.duration) || 0,
      uploadedAt: new Date(),
    });

    await interview.save();

    res.json({
      message: 'Recording uploaded successfully',
      url: uploadResult.url,
    });
  } catch (error) {
    console.error('Upload recording error:', error);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

/**
 * POST /api/interviews/:id/complete
 * Complete interview and trigger AI analysis
 */
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId')
      .populate('jobId');

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    if (interview.status === 'completed') {
      res.status(400).json({ error: 'Interview already completed' });
      return;
    }

    // Mark as completed
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = interview.startedAt
      ? Math.floor((interview.completedAt.getTime() - interview.startedAt.getTime()) / 1000)
      : 0;

    // Store Retell data if provided
    if (req.body.retellData) {
      interview.retellData = req.body.retellData;
      interview.retellCallId = req.body.retellCallId;
    }

    await interview.save();

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidateId, {
      status: 'interview_complete',
    });

    const candidate = interview.candidateId as unknown as { firstName: string; lastName: string; _id: string };
    const job = interview.jobId as unknown as { title: string; jobDNA: Record<string, unknown>; _id: string };

    // Send to n8n for processing
    try {
      await n8nService.sendInterviewResult({
        interviewId: interview._id.toString(),
        candidateId: candidate._id.toString(),
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        jobId: job._id.toString(),
        jobTitle: job.title,
        transcript: interview.transcript,
        duration: interview.duration || 0,
        recordingUrl: interview.fullRecordingUrl,
        jobDNA: job.jobDNA,
      });
    } catch (n8nError) {
      console.warn('N8N webhook failed (non-critical):', n8nError);
    }

    res.json({
      message: 'Interview completed successfully',
      interview: {
        id: interview._id,
        duration: interview.duration,
        completedAt: interview.completedAt,
      },
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
});

/**
 * POST /api/interviews/:id/analyze
 * Trigger AI analysis for completed interview (internal use)
 */
router.post('/:id/analyze', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId')
      .populate('jobId');

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    if (interview.status !== 'completed') {
      res.status(400).json({ error: 'Interview must be completed before analysis' });
      return;
    }

    const candidate = interview.candidateId as unknown as { firstName: string; lastName: string; _id: string };
    const job = interview.jobId as unknown as { title: string; jobDNA: Record<string, unknown>; _id: string };

    const startTime = Date.now();

    // Run AI analysis
    const analysisResult = await aiService.analyzeInterview(
      interview.transcript,
      job.jobDNA,
      job.title,
      `${candidate.firstName} ${candidate.lastName}`
    );

    const processingTime = Date.now() - startTime;

    // Calculate comparison to other candidates
    const otherEvaluations = await Evaluation.find({
      jobId: job._id,
      _id: { $ne: interview._id },
    });

    const totalCandidates = otherEvaluations.length + 1;
    const betterThan = otherEvaluations.filter(
      e => e.recommendation.overallScore < analysisResult.recommendation.overallScore
    ).length;
    const percentile = Math.round((betterThan / totalCandidates) * 100);

    // Create evaluation
    const evaluation = await Evaluation.create({
      candidateId: candidate._id,
      jobId: job._id,
      interviewId: interview._id,
      recommendation: analysisResult.recommendation,
      dimensionEvaluations: analysisResult.dimensionEvaluations,
      summary: analysisResult.summary,
      keyStrengths: analysisResult.keyStrengths,
      keyConcerns: analysisResult.keyConcerns,
      comparisonToOtherCandidates: {
        percentile,
        totalCandidates,
      },
      rawAIResponse: analysisResult,
      aiModel: 'gpt-4',
      processingTime,
    });

    // Update candidate
    await Candidate.findByIdAndUpdate(candidate._id, {
      status: 'ai_analysis_ready',
      evaluationId: evaluation._id,
    });

    res.json({
      message: 'Analysis completed',
      evaluation,
    });
  } catch (error) {
    console.error('Analyze interview error:', error);
    res.status(500).json({ error: 'Failed to analyze interview' });
  }
});

/**
 * POST /api/interviews/result
 * Receive interview result from external source (Retell webhook)
 */
router.post('/result', async (req: Request, res: Response) => {
  try {
    const { 
      call_id, 
      transcript, 
      call_analysis,
      recording_url,
      duration_ms,
      candidate_uid 
    } = req.body;

    console.log('Received interview result:', { call_id, candidate_uid });

    // Find interview by Retell call ID or candidate
    let interview = await Interview.findOne({ retellCallId: call_id });
    
    if (!interview && candidate_uid) {
      interview = await Interview.findOne({ 
        candidateId: candidate_uid,
        status: 'in_progress'
      });
    }

    if (!interview) {
      console.warn('Interview not found for result:', { call_id, candidate_uid });
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Update interview with Retell data
    interview.retellCallId = call_id;
    interview.retellData = {
      call_analysis,
      raw_response: req.body,
    };

    if (recording_url) {
      interview.fullRecordingUrl = recording_url;
    }

    if (transcript && Array.isArray(transcript)) {
      interview.transcript = transcript.map((t: { role: string; content: string }, index: number) => ({
        speaker: t.role === 'agent' ? 'ai' : 'candidate',
        text: t.content,
        timestamp: index * 10, // Approximate timestamp
      }));
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = duration_ms ? Math.floor(duration_ms / 1000) : 0;

    await interview.save();

    // Update candidate status
    await Candidate.findByIdAndUpdate(interview.candidateId, {
      status: 'interview_complete',
    });

    res.json({ 
      message: 'Interview result received',
      interviewId: interview._id 
    });
  } catch (error) {
    console.error('Receive result error:', error);
    res.status(500).json({ error: 'Failed to process interview result' });
  }
});

/**
 * GET /api/interviews/:id
 * Get interview details (authenticated)
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId')
      .populate('jobId');

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Verify company access
    const candidate = await Candidate.findById(interview.candidateId);
    if (candidate?.companyId.toString() !== req.user?.companyId.toString()) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to get interview' });
  }
});

export default router;
