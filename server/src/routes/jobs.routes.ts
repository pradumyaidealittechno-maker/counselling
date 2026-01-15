import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Job } from '../models/Job.js';
import { InterviewQuestion } from '../models/InterviewQuestion.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { uploadJobDescription } from '../middleware/upload.js';
import { s3Service, aiService, n8nService } from '../services/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/jobs
 * List jobs with pagination and filtering
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['draft', 'pending_review', 'approved', 'ai_training', 'ai_trained', 'active', 'archived']),
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

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      const [jobs, total] = await Promise.all([
        Job.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('createdBy', 'firstName lastName'),
        Job.countDocuments(filter),
      ]);

      res.json({
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('List jobs error:', error);
      res.status(500).json({ error: 'Failed to list jobs' });
    }
  }
);

/**
 * POST /api/jobs
 * Create a new job
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('department').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { title, department, description } = req.body;

      const job = await Job.create({
        companyId: req.user?.companyId,
        title,
        department,
        description,
        status: 'draft',
        createdBy: req.userId,
        changeHistory: [
          {
            timestamp: new Date(),
            userId: req.userId,
            userName: `${req.user?.firstName} ${req.user?.lastName}`,
            action: 'created',
            comment: 'Job created',
          },
        ],
      });

      res.status(201).json(job);
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  }
);

/**
 * GET /api/jobs/:id
 * Get job details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    }).populate('createdBy', 'firstName lastName');

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

/**
 * PUT /api/jobs/:id
 * Update job
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const allowedUpdates = ['title', 'department', 'description', 'jobDNA', 'culturalDNAEnabled', 'interviewConfig'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {} as Record<string, unknown>);

    // Track changes
    const changes = Object.keys(updates).map(key => ({
      field: key,
      oldValue: JSON.stringify((job as Record<string, unknown>)[key]),
      newValue: JSON.stringify(updates[key]),
    }));

    Object.assign(job, updates);
    job.version += 1;
    job.changeHistory.push({
      timestamp: new Date(),
      userId: req.user?._id,
      userName: `${req.user?.firstName} ${req.user?.lastName}`,
      action: 'edited',
      changes,
      comment: req.body.comment || 'Job updated',
    });

    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

/**
 * POST /api/jobs/:id/generate-dna
 * Generate Job DNA from description using AI
 */
router.post('/:id/generate-dna', async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Generate Job DNA using AI
    const jobDNA = await aiService.generateJobDNA(job.description, job.title);

    // Update job with generated DNA
    job.jobDNA = jobDNA;
    job.status = 'pending_review';
    job.version += 1;
    job.changeHistory.push({
      timestamp: new Date(),
      userId: req.user?._id,
      userName: 'AI System',
      action: 'edited',
      comment: 'Job DNA generated by AI',
    });

    // Calculate quality metrics
    const totalTraits = 
      jobDNA.skillDNA.length +
      jobDNA.experienceDNA.length +
      jobDNA.behavioralDNA.length +
      jobDNA.communicationDNA.length +
      jobDNA.culturalDNA.length;

    job.quality = {
      completenessScore: Math.min(100, totalTraits * 5),
      balanceScore: 85,
      coverageByDimension: {
        skillDNA: jobDNA.skillDNA.length * 15,
        experienceDNA: jobDNA.experienceDNA.length * 20,
        behavioralDNA: jobDNA.behavioralDNA.length * 18,
        communicationDNA: jobDNA.communicationDNA.length * 25,
        culturalDNA: jobDNA.culturalDNA.length * 30,
      },
      warnings: [],
      suggestions: [],
    };

    await job.save();

    res.json({
      message: 'Job DNA generated successfully',
      job,
    });
  } catch (error) {
    console.error('Generate DNA error:', error);
    res.status(500).json({ error: 'Failed to generate Job DNA' });
  }
});

/**
 * POST /api/jobs/:id/approve
 * Approve Job DNA
 */
router.post(
  '/:id/approve',
  authorize('admin', 'hr_manager'),
  async (req: AuthRequest, res: Response) => {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        companyId: req.user?.companyId,
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      if (job.status !== 'pending_review') {
        res.status(400).json({ error: 'Job is not pending review' });
        return;
      }

      job.approval = {
        approved: true,
        approvedBy: req.user?._id,
        approvedAt: new Date(),
        approverRole: req.user?.role,
      };
      job.status = 'approved';
      job.changeHistory.push({
        timestamp: new Date(),
        userId: req.user?._id,
        userName: `${req.user?.firstName} ${req.user?.lastName}`,
        action: 'approved',
        comment: req.body.comment || 'Job DNA approved',
      });

      await job.save();

      res.json({
        message: 'Job DNA approved successfully',
        job,
      });
    } catch (error) {
      console.error('Approve job error:', error);
      res.status(500).json({ error: 'Failed to approve job' });
    }
  }
);

/**
 * POST /api/jobs/:id/train-ai
 * Train AI on approved Job DNA and generate questions
 */
router.post('/:id/train-ai', async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (!job.approval.approved) {
      res.status(400).json({ error: 'Job DNA must be approved before training' });
      return;
    }

    job.status = 'ai_training';
    await job.save();

    // Generate interview questions using AI
    const questions = await aiService.generateInterviewQuestions(
      job.jobDNA as Record<string, unknown>,
      job.title,
      8
    );

    // Save questions to database
    const savedQuestions = await InterviewQuestion.insertMany(
      questions.map((q, index) => ({
        ...q,
        id: uuidv4(),
        jobId: job._id,
        order: index,
        isActive: true,
      }))
    );

    // Also send to n8n for additional processing if configured
    try {
      const company = await import('../models/Company.js').then(m => m.Company.findById(job.companyId));
      await n8nService.generateInterviewQuestions({
        jobId: job._id.toString(),
        jobTitle: job.title,
        jobDNA: job.jobDNA as Record<string, unknown>,
        companyName: company?.name || 'Unknown',
      });
    } catch (n8nError) {
      console.warn('N8N webhook failed (non-critical):', n8nError);
    }

    job.status = 'ai_trained';
    job.changeHistory.push({
      timestamp: new Date(),
      userId: req.user?._id,
      userName: 'AI System',
      action: 'edited',
      comment: `AI trained - ${savedQuestions.length} questions generated`,
    });

    await job.save();

    res.json({
      message: 'AI training completed',
      job,
      questions: savedQuestions,
    });
  } catch (error) {
    console.error('Train AI error:', error);
    res.status(500).json({ error: 'Failed to train AI' });
  }
});

/**
 * GET /api/jobs/:id/questions
 * Get interview questions for a job
 */
router.get('/:id/questions', async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      companyId: req.user?.companyId,
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const questions = await InterviewQuestion.find({
      jobId: job._id,
      isActive: true,
    }).sort({ order: 1 });

    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * POST /api/jobs/upload-jd
 * Upload job description file and create job
 */
router.post('/upload-jd', uploadJobDescription, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { title, department } = req.body;

    if (!title || !department) {
      res.status(400).json({ error: 'Title and department are required' });
      return;
    }

    // Create job first
    const job = await Job.create({
      companyId: req.user?.companyId,
      title,
      department,
      description: 'Processing uploaded file...',
      status: 'draft',
      createdBy: req.userId,
      source: {
        type: 'upload',
      },
      changeHistory: [
        {
          timestamp: new Date(),
          userId: req.userId,
          userName: `${req.user?.firstName} ${req.user?.lastName}`,
          action: 'created',
          comment: 'Job created from uploaded file',
        },
      ],
    });

    // Upload file to S3
    const uploadResult = await s3Service.uploadJobDescription(
      req.file.buffer,
      job._id.toString(),
      req.file.originalname,
      req.file.mimetype
    );

    job.source.originalFile = uploadResult.url;
    
    // TODO: Extract text from PDF/DOC and update description
    // For now, use a placeholder
    job.description = `Job description uploaded from file: ${req.file.originalname}`;
    
    await job.save();

    res.status(201).json({
      message: 'Job description uploaded successfully',
      job,
      fileUrl: uploadResult.url,
    });
  } catch (error) {
    console.error('Upload JD error:', error);
    res.status(500).json({ error: 'Failed to upload job description' });
  }
});

export default router;
