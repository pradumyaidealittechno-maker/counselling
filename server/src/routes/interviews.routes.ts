import { Router, Response, Request } from 'express';
import { Interview } from '../models/Interview.js';
import Candidate from '../models/Candidate.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { config } from '../config/index.js';
import retellService from '../services/retell.service.js';
import aiService from '../services/ai.service.js';
import { uploadToS3 } from '../config/s3.js';
import { upload } from '../middleware/upload.js';

const router = Router();

/**
 * POST /api/interviews/generate-code
 * Generate or retrieve an interview code for a candidate
 */
router.post('/generate-code', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { candidateId, expiresInHours } = req.body;

        if (!candidateId) {
            res.status(400).json({ error: 'Candidate ID is required' });
            return;
        }

        const candidate = await Candidate.findById(candidateId).populate({
            path: 'jobId',
            populate: { path: 'createdBy' }
        });

        if (!candidate) {
            res.status(404).json({ error: 'Candidate not found' });
            return;
        }

        const job = candidate.jobId as any;
        const jobCreator = job?.createdBy as any;
        const companyId = req.user?.companyId || jobCreator?.companyId;

        if (!companyId) {
            res.status(400).json({ error: 'Could not determine company for this interview' });
            return;
        }

        // Check if an active interview already exists
        let interview = await Interview.findOne({
            candidateId,
            status: { $in: ['pending', 'in_progress'] }
        });

        if (interview) {
            // Update expiry if requested
            if (expiresInHours) {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + expiresInHours);
                interview.invitation.expiresAt = expiresAt;
                await interview.save();
            }

            res.json({
                code: interview.invitation.code,
                expiresAt: interview.invitation.expiresAt
            });
            return;
        }

        // Create new interview
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (expiresInHours || config.interview.codeExpiryHours || 168));

        interview = await Interview.create({
            candidateId,
            jobId: job._id,
            companyId,
            invitation: {
                sentAt: new Date(),
                sentBy: req.user?.id || 'system',
                expiresAt,
                remindersSent: 0,
                isUsed: false,
            },
            status: 'pending',
        });

        // Update candidate with interview reference
        candidate.interviewId = interview._id as any;
        await candidate.save();

        res.json({
            code: interview.invitation.code,
            expiresAt: interview.invitation.expiresAt
        });
    } catch (error: any) {
        console.error('Generate code error:', error);
        res.status(500).json({ error: 'Failed to generate interview code' });
    }
});

/**
 * POST /api/interviews/validate-code
 * Public endpoint to validate an interview code
 */
router.post('/validate-code', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            res.status(400).json({ error: 'Interview code is required' });
            return;
        }

        const interview = await Interview.findOne({
            'invitation.code': code.toUpperCase(),
            status: { $ne: 'cancelled' }
        }).populate('candidateId jobId');

        if (!interview) {
            res.status(404).json({ error: 'Invalid interview code' });
            return;
        }

        // Check expiry
        if (new Date() > interview.invitation.expiresAt) {
            interview.status = 'expired';
            await interview.save();
            res.status(400).json({ error: 'Interview code has expired' });
            return;
        }

        if (interview.invitation.isUsed && interview.status === 'completed') {
            res.status(400).json({ error: 'Interview has already been completed' });
            return;
        }

        const candidate = interview.candidateId as any;
        const job = interview.jobId as any;
        const company = (job?.createdBy as any)?.companyId as any;

        res.json({
            valid: true,
            candidate_name: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Candidate',
            uid: candidate?._id,
            job_title: job?.title || 'Position',
            company_name: company?.name || 'Our Company',
            status: interview.status
        });
    } catch (error: any) {
        console.error('Validate code error:', error);
        res.status(500).json({ error: 'Failed to validate interview code' });
    }
});

/**
 * POST /api/interviews/start-session
 * Public endpoint to notify backend that an interview has started
 */
router.post('/start-session', async (req: Request, res: Response) => {
    try {
        const { candidateId, browserInfo } = req.body;

        if (!candidateId) {
            res.status(400).json({ error: 'Candidate ID is required' });
            return;
        }

        console.log('🚀 Starting interview session for candidate:', candidateId);

        const interview = await Interview.findOneAndUpdate(
            { candidateId, status: 'pending' },
            {
                status: 'in_progress',
                startedAt: new Date(),
                browserInfo
            },
            { new: true, sort: { createdAt: -1 } }
        );

        if (!interview) {
            // Might already be in progress, that's okay
            const existing = await Interview.findOne({ candidateId, status: 'in_progress' }).sort({ createdAt: -1 });
            if (existing) {
                res.json({ success: true, interviewId: existing._id });
                return;
            }
            res.status(404).json({ error: 'No pending interview found for this candidate' });
            return;
        }

        res.json({ success: true, interviewId: interview._id });
    } catch (error: any) {
        console.error('Start session error:', error);
        res.status(500).json({ error: 'Failed to start interview session' });
    }
});

/**
 * POST /api/interviews/create-web-call
 * Public endpoint for candidates to start their AI interview session
 */
/**
 * POST /api/interviews/create-web-call
 * Public endpoint for candidates to start their AI interview session
 */
router.post('/create-web-call', async (req: Request, res: Response) => {
    try {
        const { agentId } = req.body;

        console.log('🎙️ Creating Retell web call');
        const callData = await retellService.createWebCall(agentId);

        res.json(callData);
    } catch (error: any) {
        console.error('Create web call error:', error);
        res.status(500).json({ error: error.message || 'Failed to start interview session' });
    }
});

/**
 * POST /api/interviews/save-recording
 * Public endpoint to save video recording to S3
 */
router.post('/save-recording', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { uid } = req.body;

        if (!file) {
            res.status(400).json({ error: 'No recording file provided' });
            return;
        }

        console.log('🎥 Saving interview recording for candidate:', uid);

        const folder = `interviews/${uid}`;
        const filename = `recording_${Date.now()}.webm`;
        const result = await uploadToS3(file.buffer, folder, filename, file.mimetype);

        // Update interview or candidate with recording URL
        await Interview.findOneAndUpdate(
            { candidateId: uid, status: { $in: ['in_progress', 'completed'] } },
            { fullRecordingUrl: result.url },
            { sort: { createdAt: -1 } }
        );

        res.json({ success: true, url: result.url });
    } catch (error: any) {
        console.error('Save recording error:', error);
        res.status(500).json({ error: 'Failed to save recording' });
    }
});

/**
 * POST /api/interviews/submit-result
 * Public endpoint to submit interview results and trigger analysis
 */
// POST /api/interviews/submit-result
router.post('/submit-result', async (req: Request, res: Response) => {
    try {
        const { candidateId, transcript, duration, metadata } = req.body;

        if (!candidateId) {
            res.status(400).json({ error: 'Candidate ID is required' });
            return;
        }

        console.log('✅ Submitting interview results for:', candidateId);

        // Find and update interview
        const interview = await Interview.findOneAndUpdate(
            { candidateId, status: { $ne: 'completed' } },
            {
                status: 'completed',
                completedAt: new Date(),
                transcript: transcript.map((t: any) => ({
                    speaker: t.speaker,
                    text: t.text,
                    timestamp: typeof t.timestamp === 'string' ? new Date(t.timestamp).getTime() : t.timestamp
                })),
                duration,
                retellData: metadata
            },
            { new: true, sort: { createdAt: -1 } }
        ).populate('jobId');

        if (!interview) {
            res.status(404).json({ error: 'Active interview not found for this candidate' });
            return;
        }

        // Update candidate status
        await Candidate.findByIdAndUpdate(candidateId, {
            status: 'interview_completed',
            interviewStatus: 'completed'
        });

        // Trigger AI Analysis in background
        const job = interview.jobId as any;
        const formattedTranscript = interview.transcript.map(t => ({
            speaker: t.speaker,
            text: t.text,
            timestamp: t.timestamp.toString()
        }));

        aiService.analyzeInterview(
            formattedTranscript,
            job?.description || '',
            job?.requiredSkills || []
        ).then(async (analysis) => {
            // Update candidate with analysis
            await Candidate.findByIdAndUpdate(candidateId, {
                evaluation: analysis,
                score: analysis.overallScore
            });
            console.log('✅ Analysis completed for candidate:', candidateId);
        }).catch(err => console.error('Background analysis error:', err));

        res.json({ success: true, interviewId: interview._id });
    } catch (error: any) {
        console.error('Submit result error:', error);
        res.status(500).json({ error: 'Failed to submit interview results' });
    }
});

/**
 * GET /api/interviews/active-sessions
 * Protected endpoint for HR to see live interviews
 */
router.get('/active-sessions', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const interviews = await Interview.find({
            status: 'in_progress'
        }).populate('candidateId');

        const sessions = interviews.map(i => {
            const candidate = i.candidateId as any;
            return {
                _id: i._id,
                candidateId: candidate?._id,
                candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown',
                startedAt: i.startedAt || i.createdAt,
                status: i.status
            };
        });

        res.json(sessions);
    } catch (error: any) {
        console.error('Active sessions error:', error);
        res.status(500).json({ error: 'Failed to load active sessions' });
    }
});

/**
 * POST /api/interviews/end-session
 * Protected endpoint for HR to manually end an interview
 */
router.post('/end-session', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { candidateId } = req.body;

        const interview = await Interview.findOneAndUpdate(
            { candidateId, status: 'in_progress' },
            { status: 'completed', completedAt: new Date() },
            { new: true, sort: { createdAt: -1 } }
        );

        if (!interview) {
            res.status(404).json({ error: 'No active session found' });
            return;
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('End session error:', error);
        res.status(500).json({ error: 'Failed to end interview' });
    }
});

export default router;
