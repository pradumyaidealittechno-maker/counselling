import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { Interview } from '../models/Interview.js';
import { Evaluation } from '../models/Evaluation.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadResume, uploadResumes } from '../middleware/upload.js';
import { s3Service, n8nService } from '../services/index.js';
import { config } from '../config/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/candidates
 * List candidates with pagination and filtering
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('jobId').optional().isMongoId(),
    query('status').optional(),
    query('search').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {
        companyId: req.user?.companyId,
      };

      if (req.query.jobId) {
        filter.jobId = req.query.jobId;
      }

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      const [candidates, total] = await Promise.all([
        Candidate.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('jobId', 'title department')
          .populate('evaluationId'),
        Candidate.countDocuments(filter),
      ]);

      res.json({
        candidates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('List candidates error:', error);
      res.status(500).json({ error: 'Failed to list candidates' });
    }
  }
);

/**
 * POST /api/candidates
 * Create a new candidate
 */
router.post(
  '/',
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('jobId').isMongoId(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { firstName, lastName, email, phone, jobId, source, tags } = req.body;

      // Verify job exists and belongs to company
      const job = await Job.findOne({
        _id: jobId,
        companyId: req.user?.companyId,
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      // Check if candidate already exists for this job
      const existingCandidate = await Candidate.findOne({ email, jobId });
      if (existingCandidate) {
        res.status(400).json({ error: 'Candidate already exists for this job' });
        return;
      }

      const candidate = await Candidate.create({
        companyId: req.user?.companyId,
        jobId,
        firstName,
        lastName,
        email,
        phone,
        source: source || 'manual',
        tags: tags || [],
        status: 'resume_screened',
      });

      res.status(201).json(candidate);
    } catch (error) {
      console.error('Create candidate error:', error);
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  }
);

/**
 * GET /api/candidates/:id
 * Get candidate details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    })
      .populate('jobId')
      .populate('interviewId')
      .populate('evaluationId');

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to get candidate' });
  }
});

/**
 * POST /api/candidates/:id/upload-resume
 * Upload resume for a candidate
 */
router.post('/:id/upload-resume', uploadResume, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const candidate = await Candidate.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Upload to S3
    const uploadResult = await s3Service.uploadResume(
      req.file.buffer,
      candidate._id.toString(),
      req.file.originalname,
      req.file.mimetype
    );

    // Update candidate
    candidate.resume = {
      url: uploadResult.url,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
    };

    await candidate.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: candidate.resume,
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

/**
 * POST /api/candidates/bulk-upload
 * Bulk upload resumes and create candidates
 */
router.post(
  '/bulk-upload',
  uploadResumes,
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const { jobId } = req.body;
      if (!jobId) {
        res.status(400).json({ error: 'Job ID is required' });
        return;
      }

      // Verify job exists
      const job = await Job.findOne({
        _id: jobId,
        companyId: req.user?.companyId,
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const results = {
        success: [] as string[],
        failed: [] as { file: string; error: string }[],
      };

      for (const file of files) {
        try {
          // Extract name from filename (basic approach)
          const nameFromFile = file.originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          const nameParts = nameFromFile.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || 'Candidate';

          // Create candidate
          const candidate = await Candidate.create({
            companyId: req.user?.companyId,
            jobId,
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@placeholder.com`,
            source: 'bulk_upload',
            status: 'resume_screened',
          });

          // Upload resume to S3
          const uploadResult = await s3Service.uploadResume(
            file.buffer,
            candidate._id.toString(),
            file.originalname,
            file.mimetype
          );

          candidate.resume = {
            url: uploadResult.url,
            fileName: file.originalname,
            uploadedAt: new Date(),
          };

          await candidate.save();

          results.success.push(file.originalname);
        } catch (err) {
          results.failed.push({
            file: file.originalname,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      res.json({
        message: `Processed ${files.length} files`,
        results,
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Failed to process bulk upload' });
    }
  }
);

/**
 * POST /api/candidates/:id/invite
 * Send interview invitation to candidate
 */
router.post('/:id/invite', async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    }).populate('jobId');

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    const job = candidate.jobId as unknown as { _id: string; title: string; status: string };

    if (!job || job.status !== 'ai_trained' && job.status !== 'active') {
      res.status(400).json({ error: 'Job must be AI trained before sending invitations' });
      return;
    }

    // Check if interview already exists
    let interview = await Interview.findOne({ candidateId: candidate._id });

    if (interview && interview.status !== 'expired' && interview.status !== 'cancelled') {
      res.status(400).json({ error: 'Interview invitation already sent' });
      return;
    }

    // Create interview invitation
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.interview.codeExpiryHours);

    interview = await Interview.create({
      candidateId: candidate._id,
      jobId: job._id,
      companyId: req.user?.companyId,
      invitation: {
        sentAt: new Date(),
        sentBy: req.userId,
        expiresAt,
        remindersSent: 0,
        isUsed: false,
      },
      status: 'pending',
    });

    // Update candidate status
    candidate.status = 'pending_interview';
    candidate.interviewId = interview._id;
    await candidate.save();

    // Get company name
    const company = await import('../models/Company.js').then(m => m.Company.findById(req.user?.companyId));

    // Send email via n8n
    const interviewUrl = `${config.frontendUrl}/interview/${interview.invitation.code}`;
    
    await n8nService.sendInterviewInvitation(
      candidate.email,
      `${candidate.firstName} ${candidate.lastName}`,
      job.title,
      company?.name || 'Company',
      interview.invitation.code,
      interviewUrl,
      expiresAt
    );

    res.json({
      message: 'Interview invitation sent successfully',
      interview: {
        id: interview._id,
        code: interview.invitation.code,
        expiresAt: interview.invitation.expiresAt,
        interviewUrl,
      },
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

/**
 * POST /api/candidates/:id/decision
 * Submit final hiring decision
 */
router.post(
  '/:id/decision',
  [
    body('decision').isIn(['Hire', 'Hold', 'Reject']),
    body('notes').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const candidate = await Candidate.findOne({
        _id: req.params.id,
        companyId: req.user?.companyId,
      });

      if (!candidate) {
        res.status(404).json({ error: 'Candidate not found' });
        return;
      }

      const { decision, notes } = req.body;

      candidate.finalDecision = {
        decision,
        decidedBy: req.user?._id,
        decidedAt: new Date(),
        notes,
      };
      candidate.status = 'decision_made';

      await candidate.save();

      res.json({
        message: 'Decision recorded successfully',
        candidate,
      });
    } catch (error) {
      console.error('Submit decision error:', error);
      res.status(500).json({ error: 'Failed to submit decision' });
    }
  }
);

/**
 * GET /api/candidates/:id/evaluation
 * Get candidate evaluation
 */
router.get('/:id/evaluation', async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    const evaluation = await Evaluation.findOne({
      candidateId: candidate._id,
    });

    if (!evaluation) {
      res.status(404).json({ error: 'Evaluation not found' });
      return;
    }

    res.json(evaluation);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: 'Failed to get evaluation' });
  }
});

export default router;
