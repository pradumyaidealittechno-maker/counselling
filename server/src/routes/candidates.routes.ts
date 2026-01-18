import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import { Interview } from '../models/Interview.js';
import { Evaluation } from '../models/Evaluation.js';

import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadResume, uploadResumes } from '../middleware/upload.js';
import { s3Service } from '../services/s3.service.js';
import n8nService from '../services/n8n.service.js';
import { config } from '../config/index.js';

const router = Router();

const refreshCandidateResumeUrl = async (candidateDoc: any) => {
<<<<<<< Updated upstream
  // Convert to plain object if it's a mongoose document, preserving all fields
  const candidate = candidateDoc.toObject ? candidateDoc.toObject({ 
    virtuals: true,
    versionKey: false,
    transform: false 
  }) : candidateDoc;

  try {
    let key = '';
    const originalUrl = candidate.resume?.url || candidate.resumeUrl;

    if (originalUrl) {
      try {
        const urlObj = new URL(originalUrl);
        // Robust key extraction: remove the leading slash
        key = decodeURIComponent(urlObj.pathname.substring(1));

        // If providing a full URL that includes bucket in host, pathname is the key.
        // If using path-style (s3.amazonaws.com/bucket/key), pathname starts with bucket.
        // We assume virtual-hosted style (bucket.s3.region.amazonaws.com/key) based on screenshots.
        // If extraction fails to generate a working link, we might need to revisit.

        if (key) {
          const signedUrl = await s3Service.getSignedUrl(key);
          if (candidate.resume) {
            candidate.resume.url = signedUrl;
          }
          if (candidate.resumeUrl) {
            candidate.resumeUrl = signedUrl;
          }
=======
    // Convert to plain object if it's a mongoose document
    const candidate = candidateDoc.toObject ? candidateDoc.toObject() : candidateDoc;

    try {
        let key = '';
        const originalUrl = candidate.resume?.url || candidate.resumeUrl;

        if (originalUrl) {
            try {
                const urlObj = new URL(originalUrl);
                // Robust key extraction: remove the leading slash
                key = decodeURIComponent(urlObj.pathname.substring(1));

                // If providing a full URL that includes bucket in host, pathname is the key.
                // If using path-style (s3.amazonaws.com/bucket/key), pathname starts with bucket.
                // We assume virtual-hosted style (bucket.s3.region.amazonaws.com/key) based on screenshots.
                // If extraction fails to generate a working link, we might need to revisit.

                if (key) {
                    const signedUrl = await s3Service.getSignedUrl(key);
                    if (candidate.resume) {
                        candidate.resume.url = signedUrl;
                    }
                    if (candidate.resumeUrl) {
                        candidate.resumeUrl = signedUrl;
                    }
                }
            } catch (e) {
                console.warn('URL parsing failed for:', originalUrl);
            }
>>>>>>> Stashed changes
        }
    } catch (error) {
        console.warn('Error refreshing candidate URL:', error);
    }
    return candidate;
};

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/candidates
 * List candidates with pagination and filtering
 */
router.get(
<<<<<<< Updated upstream
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

      const filter: Record<string, unknown> = {};

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

      // Debug: Check first candidate before transformation
      if (candidates.length > 0) {
        console.log('🔍 First candidate from DB (raw):', {
          id: candidates[0]._id,
          email: candidates[0].email,
          experience: candidates[0].experience,
          hasExperienceField: 'experience' in candidates[0]
        });
      }

      // Refresh resume URLs and get plain objects
      const candidatesWithSignedUrls = await Promise.all(
        candidates.map(candidate => refreshCandidateResumeUrl(candidate))
      );

      // Debug: Check first candidate after transformation
      if (candidatesWithSignedUrls.length > 0) {
        console.log('🔍 First candidate after transform:', {
          id: candidatesWithSignedUrls[0]._id,
          email: candidatesWithSignedUrls[0].email,
          experience: candidatesWithSignedUrls[0].experience,
          hasExperienceField: 'experience' in candidatesWithSignedUrls[0],
          allKeys: Object.keys(candidatesWithSignedUrls[0])
        });
      }

      res.json({
        candidates: candidatesWithSignedUrls,
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
=======
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

            const filter: Record<string, unknown> = {};

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

            // Refresh resume URLs and get plain objects
            const candidatesWithSignedUrls = await Promise.all(
                candidates.map(candidate => refreshCandidateResumeUrl(candidate))
            );

            res.json({
                candidates: candidatesWithSignedUrls,
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
>>>>>>> Stashed changes
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

            const { firstName, lastName, email, phone, jobId, source, tags, experience } = req.body;

            console.log('📝 REQUEST BODY:', req.body);
            console.log('📝 Experience from body:', experience);

            // Verify job exists
            const job = await Job.findOne({
                _id: jobId,
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

            const candidateData = {
                jobId,
                firstName,
                lastName,
                email,
                phone,
                experience,
                status: 'new' as const,
                createdBy: req.user?.id,
            };

            console.log('💾 Data being saved to DB:', candidateData);

            const candidate = await Candidate.create(candidateData);

            console.log('✅ Candidate created:', {
                id: candidate._id,
                experience: candidate.experience,
                fullDoc: candidate.toObject()
            });

            // Populate job details before sending response
            await candidate.populate('jobId', 'title department');

            console.log('📤 Sending response with experience:', candidate.experience);

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
        const candidateDoc = await Candidate.findOne({
            _id: req.params.id,
        })
            .populate('jobId')
            .populate('interviewId')
            .populate('evaluationId');

        if (!candidateDoc) {
            res.status(404).json({ error: 'Candidate not found' });
            return;
        }

        const candidate = await refreshCandidateResumeUrl(candidateDoc);

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
                        jobId,
                        firstName,
                        lastName,
                        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@placeholder.com`,
                        status: 'resume_screened',
                        createdBy: req.user?.id,
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
                sentBy: req.user?.id || 'system',
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



        // Send email via n8n
        const interviewUrl = `${config.frontendUrl}/interview/${interview.invitation.code}`;

        await n8nService.sendInvitationEmail(
            candidate.email,
            `${candidate.firstName} ${candidate.lastName}`,
            interviewUrl,
            interview.invitation.code,
            job.title
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
 * POST /api/candidates/:id/resend-invitation
 * Resend interview invitation with custom content
 */
router.post('/:id/resend-invitation', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, subject, message } = req.body;

        const candidate = await Candidate.findById(id).populate('jobId');
        if (!candidate) {
            res.status(404).json({ error: 'Candidate not found' });
            return;
        }

        const interview = await Interview.findOne({ candidateId: candidate._id });
        if (!interview) {
            res.status(400).json({ error: 'No existing interview found for this candidate. Please send an initial invitation first.' });
            return;
        }

        const job = candidate.jobId as any;
        const interviewUrl = `${config.frontendUrl}/interview/${interview.invitation.code}`;

        // Send email via n8n with custom subject/body if provided
        // Remove prefix if already present to avoid doubling in n8n
        const cleanSubject = (subject || '').replace(/^Interview Invitation - /i, '');

        await n8nService.sendInvitationEmail(
            email || candidate.email,
            `${firstName || candidate.firstName} ${lastName || candidate.lastName}`,
            interviewUrl,
            interview.invitation.code,
            job?.title || 'Position',
            cleanSubject || undefined,
            message
        );

        res.json({ message: 'Invitation resent successfully' });
    } catch (error: any) {
        console.error('Resend invitation error:', error);
        res.status(500).json({ error: 'Failed to resend invitation', details: error.message });
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
                decidedBy: req.user?.id,
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

/**
 * POST /api/candidates/parse-resume
 * Parse resume and extract candidate information (does not save the file)
 */
router.post('/parse-resume', uploadResume, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        console.log('📄 Parsing resume:', req.file.originalname);
        console.log('📋 File type:', req.file.mimetype);
        console.log('📏 File size:', req.file.size, 'bytes');

        // Import libraries
        let pdfParse: any;
        try {
            const pdfParseLib: any = await import('pdf-parse');
            if (typeof pdfParseLib === 'function') {
                pdfParse = pdfParseLib;
            } else if (typeof pdfParseLib.default === 'function') {
                pdfParse = pdfParseLib.default;
            } else if (typeof pdfParseLib.PDFParse === 'function') {
                // Handling case where library exports an object with PDFParse function
                pdfParse = pdfParseLib.PDFParse;
            }

            // Strategy 2: CommonJS Require (Fallback)
            if (!pdfParse) {
                try {
                    // @ts-ignore
                    const { createRequire } = await import('module');
                    // Use process.cwd() to resolve from project root (node_modules should be found)
                    const require = createRequire(process.cwd() + '/');
                    const lib = require('pdf-parse');

                    if (typeof lib === 'function') {
                        pdfParse = lib;
                    } else if (typeof lib.default === 'function') {
                        pdfParse = lib.default;
                    } else if (typeof lib.PDFParse === 'function') {
                        pdfParse = lib.PDFParse;
                    } else {
                        pdfParse = lib; // assign anyway to see if validation catches it
                    }
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
            console.warn('⚠️  Mammoth library not available');
        }
        const { default: aiService } = await import('../services/ai.service.js');

        let resumeText = '';

        // Extract text based on file type
        // Extract text based on file type
        if (req.file.mimetype === 'application/pdf') {
            console.log('🔍 Extracting text from PDF...');
            try {
                let pdfData: any;
                // Handling different pdf-parse library versions
                if (pdfParse.prototype && typeof pdfParse.prototype.getText === 'function') {
                    // Class-based library (installed version)
                    const parser = new pdfParse({ data: req.file.buffer });
                    pdfData = await parser.getText();
                } else {
                    // Function-based library (standard version)
                    pdfData = await pdfParse(req.file.buffer);
                }
                resumeText = pdfData.text;
                console.log('✅ PDF text extracted, length:', resumeText.length);
            } catch (pdfError: any) {
                console.error('❌ PDF extraction error:', pdfError);
                throw new Error(`PDF extraction failed: ${pdfError.message}`);
            }
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // DOCX file - use mammoth for better extraction
            console.log('🔍 Extracting text from DOCX using mammoth...');
            if (mammoth) {
                try {
                    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
                    resumeText = result.value;
                    console.log('✅ DOCX text extracted, length:', resumeText.length);
                    if (result.messages && result.messages.length > 0) {
                        console.log('⚠️  Mammoth messages:', result.messages);
                    }
                } catch (mammothError: any) {
                    console.warn('⚠️  Mammoth extraction failed:', mammothError.message);
                    resumeText = req.file.buffer.toString('utf-8');
                }
            } else {
                resumeText = req.file.buffer.toString('utf-8');
            }
        } else if (req.file.mimetype === 'application/msword') {
            // DOC file - basic extraction (mammoth doesn't support .doc well)
            console.log('🔍 Extracting text from DOC (basic)...');
            resumeText = req.file.buffer.toString('utf-8');
            console.log('✅ DOC text extracted, length:', resumeText.length);
        } else {
            res.status(400).json({ error: 'Unsupported file type. Please upload PDF, DOC, or DOCX' });
            return;
        }

        console.log('📝 Extracted text preview:', resumeText.substring(0, 200) + '...');

        if (!resumeText || resumeText.trim().length < 50) {
            console.error('❌ Extracted text too short:', resumeText.length);
            res.status(400).json({
                error: 'Could not extract sufficient text from resume. Please ensure the file is not empty, corrupted, or image-based.'
            });
            return;
        }

        // Parse resume using AI
        console.log('🤖 Sending to AI for parsing...');
        let candidateData;
        try {
            candidateData = await (aiService as any).parseResume(resumeText);
            console.log('✅ Parsed candidate data:', candidateData);
        } catch (aiError: any) {
            console.error('❌ AI parsing failed:', aiError.message);
            console.error('AI error details:', aiError);
            res.status(500).json({
                error: 'AI parsing failed',
                details: aiError.message || 'Could not extract candidate information. Please enter details manually.'
            });
            return;
        }

        res.json({
            success: true,
            data: candidateData,
        });
    } catch (error: any) {
        console.error('❌ Parse resume error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to parse resume. Please try again or enter details manually.',
            details: error.message
        });
    }
});

export default router;
