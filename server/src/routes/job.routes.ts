import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import aiService from '../services/ai.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/jobs
 * List all jobs for the authenticated user's company
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const jobs = await Job.find({
            createdBy: req.user?.id
        }).sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        console.error('List jobs error:', error);
        res.status(500).json({ error: 'Failed to list jobs' });
    }
});

/**
 * GET /api/jobs/:id
 * Get a specific job by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.user?.id
        });

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
 * POST /api/jobs
 * Create a new job
 */
router.post(
    '/',
    [
        body('title').trim().notEmpty(),
        body('description').trim().notEmpty(),
        body('location').trim().notEmpty(),
        body('experienceLevel').isIn(['entry', 'mid', 'senior', 'lead']),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const {
                title,
                description,
                location,
                employmentType,
                experienceLevel,
                requiredSkills,
                optionalSkills,
            } = req.body;

            const job = await Job.create({
                title,
                description,
                company: 'Company', // Will be populated from user's company in production
                location,
                employmentType: employmentType || 'full-time',
                experienceLevel,
                requiredSkills: requiredSkills || [],
                optionalSkills: optionalSkills || [],
                createdBy: req.user?.id,
                status: 'draft',
            });

            res.status(201).json(job);
        } catch (error) {
            console.error('Create job error:', error);
            res.status(500).json({ error: 'Failed to create job' });
        }
    }
);

/**
 * PATCH /api/jobs/:id
 * Update a job
 */
router.patch('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.user?.id,
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        res.json(job);
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

/**
 * POST /api/jobs/:id/generate-dna
 * Generate Job DNA using AI
 */
router.post('/:id/generate-dna', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        // Generate DNA using AI service
        const jobDNA = await aiService.generateJobDNA(job.description);

        // Update job with generated DNA
        job.jobDNA = jobDNA;
        await job.save();

        res.json({ jobDNA });
    } catch (error) {
        console.error('Generate DNA error:', error);
        res.status(500).json({ error: 'Failed to generate Job DNA' });
    }
});

/**
 * POST /api/jobs/:id/generate-questions
 * Generate interview questions using AI
 */
router.post('/:id/generate-questions', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        const { count, customPrompt } = req.body;

        // Generate questions using AI service
        const questions = await aiService.generateInterviewQuestions({
            jobTitle: job.title,
            jobDescription: job.description,
            requiredSkills: job.requiredSkills,
            experienceLevel: job.experienceLevel,
            jobDNA: job.jobDNA,
            count,
            customPrompt,
        });

        // Update job with generated questions
        job.interviewQuestions = questions;
        job.status = 'active';
        await job.save();

        res.json({ questions });
    } catch (error) {
        console.error('Generate questions error:', error);
        res.status(500).json({ error: 'Failed to generate interview questions' });
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
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        res.json(job.interviewQuestions || []);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Failed to get interview questions' });
    }
});

/**
 * POST /api/jobs/:id/questions
 * Add a custom interview question
 */
router.post('/:id/questions', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        const question = req.body;
        job.interviewQuestions.push(question);
        await job.save();

        res.status(201).json(question);
    } catch (error) {
        console.error('Add question error:', error);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

/**
 * PATCH /api/jobs/:id/questions/:questionId
 * Update an interview question
 */
router.patch('/:id/questions/:questionId', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        const questionIndex = job.interviewQuestions.findIndex(
            (q) => q.id === req.params.questionId
        );

        if (questionIndex === -1) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }

        job.interviewQuestions[questionIndex] = {
            ...job.interviewQuestions[questionIndex],
            ...req.body,
        };

        await job.save();

        res.json(job.interviewQuestions[questionIndex]);
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

/**
 * DELETE /api/jobs/:id/questions/:questionId
 * Delete an interview question
 */
router.delete('/:id/questions/:questionId', async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            createdBy: req.user?.id,
        });

        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }

        job.interviewQuestions = job.interviewQuestions.filter(
            (q) => q.id !== req.params.questionId
        );

        await job.save();

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

/**
 * POST /api/jobs/parse-jd
 * Parse job description from file (PDF, DOC, DOCX)
 */
router.post('/parse-jd', upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        // Import libraries dynamically to be safe with different environments
        let pdfParse: any;
        try {
            const pdfParseLib: any = await import('pdf-parse');
            if (typeof pdfParseLib === 'function') {
                pdfParse = pdfParseLib;
            } else if (typeof pdfParseLib.default === 'function') {
                pdfParse = pdfParseLib.default;
            } else if (typeof pdfParseLib.PDFParse === 'function') {
                pdfParse = pdfParseLib.PDFParse;
            }

            if (!pdfParse) {
                try {
                    // @ts-ignore
                    const { createRequire } = await import('module');
                    const require = createRequire(process.cwd() + '/');
                    const lib = require('pdf-parse');
                    if (typeof lib === 'function') pdfParse = lib;
                    else if (typeof lib.default === 'function') pdfParse = lib.default;
                    else if (typeof lib.PDFParse === 'function') pdfParse = lib.PDFParse;
                    else pdfParse = lib;
                } catch (requireError) {
                    console.warn('Require fallback failed:', requireError);
                }
            }

            if (typeof pdfParse !== 'function') {
                throw new Error(`pdf-parse is not a function: ${typeof pdfParse}`);
            }
        } catch (e: any) {
            console.error('Failed to import pdf-parse:', e);
            throw new Error(`PDF parser could not be loaded: ${e.message}`);
        }

        let mammoth: any = null;
        try {
            mammoth = await import('mammoth');
        } catch (mammothError) {
            console.warn('⚠️ Mammoth library not available');
        }

        let extractedText = '';

        // Extract text based on file type
        if (req.file.mimetype === 'application/pdf') {
            console.log('🔍 Extracting text from PDF...');
            try {
                let pdfData: any;
                if (pdfParse.prototype && typeof pdfParse.prototype.getText === 'function') {
                    const parser = new pdfParse({ data: req.file.buffer });
                    pdfData = await parser.getText();
                } else {
                    pdfData = await pdfParse(req.file.buffer);
                }
                extractedText = pdfData.text;
                console.log('✅ PDF text extracted, length:', extractedText.length);
            } catch (pdfError: any) {
                console.error('❌ PDF extraction error:', pdfError);
                throw new Error(`PDF extraction failed: ${pdfError.message}`);
            }
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            console.log('🔍 Extracting text from DOCX using mammoth...');
            if (mammoth) {
                try {
                    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
                    extractedText = result.value;
                    console.log('✅ DOCX text extracted, length:', extractedText.length);
                } catch (mammothError: any) {
                    console.warn('⚠️ Mammoth extraction failed:', mammothError.message);
                    extractedText = req.file.buffer.toString('utf-8');
                }
            } else {
                extractedText = req.file.buffer.toString('utf-8');
            }
        } else if (req.file.mimetype === 'application/msword' || req.file.mimetype === 'text/plain') {
            console.log('🔍 Extracting text from DOC or TXT...');
            extractedText = req.file.buffer.toString('utf-8');
            console.log('✅ Text extracted, length:', extractedText.length);
        } else {
            res.status(400).json({ error: 'Unsupported file type. Please upload PDF, DOC, or DOCX' });
            return;
        }

        if (!extractedText || extractedText.trim().length < 50) {
            console.error('❌ Extracted text too short:', extractedText.length);
            res.status(400).json({
                error: 'Could not extract sufficient text from the file. Please ensure it is not empty or image-based.'
            });
            return;
        }

        // Parse JD using AI
        console.log('🤖 Sending to AI for parsing...');
        const jobData = await aiService.parseJobDescription(extractedText);

        // Return exactly what the frontend expects
        res.json({
            success: true,
            ...jobData,
            text: extractedText // Use full raw text as requested by user
        });
    } catch (error: any) {
        console.error('❌ Parse JD error:', error);
        res.status(500).json({
            error: 'Failed to parse job description. Please try again or enter details manually.',
            details: error.message
        });
    }
});

export default router;
