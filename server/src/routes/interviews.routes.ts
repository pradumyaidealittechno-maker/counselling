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
        candidateId: candidate._id.toString(),
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: (interview.candidateId as any).email || '',
        interviewData: {
          interviewId: interview._id.toString(),
          jobId: job._id.toString(),
          jobTitle: job.title,
          jobDNA: job.jobDNA,
        },
        transcript: interview.transcript,
        duration: interview.duration || 0,
        recordingUrl: interview.fullRecordingUrl,
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

    const candidate = interview.candidateId as any;
    const job = interview.jobId as any;

    const startTime = Date.now();

    // Run AI analysis
    // CRITICAL FIX: Pass correct arguments to aiService (description, requiredSkills)
    // Map transcript to match expected format (timestamp as string)
    const transcriptForAI = interview.transcript.map((t: any) => ({
        speaker: t.speaker,
        text: t.text,
        timestamp: String(t.timestamp)
    }));

    const analysisResult = await aiService.analyzeInterview(
      transcriptForAI,
      job.description,
      job.requiredSkills || []
    );

    const processingTime = Date.now() - startTime;

    // Calculate comparison to other candidates
    const otherEvaluations = await Evaluation.find({
      jobId: job._id,
      _id: { $ne: interview._id },
    });

    const totalCandidates = otherEvaluations.length + 1;
    const betterThan = otherEvaluations.filter(
      e => e.recommendation.overallScore < analysisResult.overallScore
    ).length;
    const percentile = Math.round((betterThan / totalCandidates) * 100);

    // Map recommendation string to decision enum
    const recMap: Record<string, 'Hire' | 'Hold' | 'Reject'> = {
        'strong_hire': 'Hire',
        'hire': 'Hire',
        'maybe': 'Hold',
        'no_hire': 'Reject'
    };
    const decision = recMap[analysisResult.recommendation] || 'Hold';

    // Create evaluation
    // Map simplified AI result to complex Evaluation schema
    const evaluation = await Evaluation.create({
      candidateId: candidate._id,
      jobId: job._id,
      interviewId: interview._id,
      recommendation: {
          decision: decision,
          confidence: 85, // Default confidence as AI service doesn't return it
          overallScore: analysisResult.overallScore
      },
      dimensionEvaluations: {
          skillDNA: { 
              overallScore: analysisResult.technicalSkills.score, 
              strengths: analysisResult.technicalSkills.strengths,
              gaps: analysisResult.technicalSkills.weaknesses,
              impact: 'positive',
              traitEvaluations: [] // Not returned by simple analysis
          },
          communicationDNA: {
              overallScore: analysisResult.communication.score,
              strengths: [],
              gaps: [],
              impact: 'positive',
              traitEvaluations: []
          },
          culturalDNA: {
              overallScore: analysisResult.culturalFit.score,
              strengths: analysisResult.culturalFit.alignment,
              gaps: [],
              impact: 'positive',
              traitEvaluations: []
          },
          behavioralDNA: {
              overallScore: analysisResult.problemSolving.score, // Mapping problem solving to behavioral
              strengths: [],
              gaps: [],
              impact: 'positive',
              traitEvaluations: []
          }
      },
      summary: analysisResult.summary,
      keyStrengths: analysisResult.keyInsights,
      keyConcerns: analysisResult.redFlags,
      comparisonToOtherCandidates: {
        percentile,
        totalCandidates,
      },
      rawAIResponse: analysisResult as any,
      aiModel: 'gpt-4',
      processingTime,
    });

    // Update candidate
    await Candidate.findByIdAndUpdate(candidate._id, {
      status: 'ai_analysis_ready',
      evaluationId: evaluation._id,
      analysis: {
        overallScore: analysisResult.overallScore,
        technicalSkills: analysisResult.technicalSkills,
        communication: analysisResult.communication,
        problemSolving: analysisResult.problemSolving,
        culturalFit: analysisResult.culturalFit,
        recommendation: analysisResult.recommendation, // String format
        summary: analysisResult.summary,
        keyInsights: analysisResult.keyInsights,
        redFlags: analysisResult.redFlags
      }
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
    if (candidate?.companyId.toString() !== req.user?.companyId?.toString()) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to get interview' });
  }
});

/**
 * POST /api/interviews/generate-code
 * Generate unique interview code for candidate (admin only)
 */
router.post('/generate-code', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { candidateId, expiresInHours = 168 } = req.body; // Default 7 days

    if (!candidateId) {
      res.status(400).json({ error: 'Candidate ID is required' });
      return;
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Generate unique code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Create or update interview
    let interview = await Interview.findOne({ candidateId: candidate._id, status: { $ne: 'completed' } });
    
    if (!interview) {
      interview = await Interview.create({
        candidateId: candidate._id,
        jobId: candidate.jobId,
        companyId: candidate.companyId,
        invitation: {
          code,
          expiresAt,
          isUsed: false,
        },
        status: 'pending',
      });
    } else {
      interview.invitation.code = code;
      interview.invitation.expiresAt = expiresAt;
      interview.invitation.isUsed = false;
      await interview.save();
    }

    console.log(`✅ Interview code generated for ${candidate.firstName} ${candidate.lastName}: ${code}`);

    res.json({
      code,
      expiresAt,
      candidateId: candidate._id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
    });
  } catch (error: any) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: 'Failed to generate interview code' });
  }
});

/**
 * POST /api/interviews/start-session
 * Track when interview session starts
 */
router.post('/start-session', async (req: Request, res: Response) => {
  try {
    const { candidateId, browserInfo } = req.body;

    if (!candidateId) {
      res.status(400).json({ error: 'Candidate ID is required' });
      return;
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Update candidate status
    await Candidate.findByIdAndUpdate(candidateId, {
      status: 'interview_in_progress',
    });

    // Update interview
    await Interview.findOneAndUpdate(
      { candidateId, status: { $in: ['pending', 'in_progress'] } },
      {
        status: 'in_progress',
        startedAt: new Date(),
        browserInfo: browserInfo || {},
      }
    );

    console.log(`🎥 Interview STARTED: ${candidate.firstName} ${candidate.lastName} (${candidateId})`);

    res.json({
      success: true,
      sessionId: candidate._id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      startedAt: new Date(),
    });
  } catch (error: any) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start interview session' });
  }
});

/**
 * POST /api/interviews/end-session
 * Track when interview session ends
 */
router.post('/end-session', async (req: Request, res: Response) => {
  try {
    const { candidateId, sessionId, duration } = req.body;

    const id = candidateId || sessionId;
    if (!id) {
      res.status(400).json({ error: 'Candidate ID or Session ID is required' });
      return;
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Update candidate status
    candidate.status = 'interview_complete';
    await candidate.save();

    // Update interview
    const interview = await Interview.findOne({ candidateId: id, status: 'in_progress' });
    if (interview) {
      interview.status = 'completed';
      interview.completedAt = new Date();
      
      if (duration) {
        interview.duration = duration;
      } else if (interview.startedAt) {
        interview.duration = Math.floor((Date.now() - interview.startedAt.getTime()) / 1000);
      }

      await interview.save();
    }

    console.log(`✅ Interview COMPLETED: ${candidate.firstName} ${candidate.lastName} (${id})`);

    res.json({
      success: true,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      completedAt: new Date(),
      duration: duration || interview?.duration,
    });
  } catch (error: any) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end interview session' });
  }
});

/**
 * GET /api/interviews/active-sessions
 * Get list of currently active interview sessions (admin only)
 */
router.get('/active-sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const activeInterviews = await Interview.find({
      status: 'in_progress',
    })
      .populate('candidateId', 'firstName lastName email')
      .sort({ startedAt: -1 });

    const sessions = activeInterviews.map((interview) => {
      const candidate = interview.candidateId as any;
      return {
        _id: interview._id,
        candidateId: candidate._id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        startedAt: interview.startedAt,
        status: 'in_progress',
      };
    });

    res.json(sessions);
  } catch (error: any) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

export default router;
