import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CandidateResult } from '../models/CandidateResult.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToS3, getSignedDownloadUrl } from '../config/s3.js';
import n8nService from '../services/n8n.service.js';
import aiService from '../services/ai.service.js';

import * as pdfParseModule from 'pdf-parse';
import WordExtractor from 'word-extractor';
const extractor = new WordExtractor();

const router = express.Router();

// Parse Resume (protected) - New Endpoint
router.post('/parse-resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text = '';

    // Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const data = await pdfParse(file.buffer);
        text = data.text;
      } catch (err) {
        console.error('PDF Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse PDF' });
      }
    } else if (file.mimetype === 'text/plain') {
      text = file.buffer.toString('utf-8');
    } else if (
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      console.log('📄 Parsing Word File:', file.originalname);
      try {
        const doc = await extractor.extract(file.buffer);
        text = doc.getBody();
      } catch (err) {
        console.error('Word Parse Error:', err);
        return res.status(500).json({ error: 'Failed to parse Word document' });
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or TXT.' });
    }

    // AI Extraction
    console.log('🤖 Parsing Resume with AI...');
    try {
      // Limit text length to avoid token limits (approx 15k chars is safe for gpt-4)
      const truncatedText = text.substring(0, 15000);

      const aiData = await aiService.parseResume(truncatedText);
      console.log('✅ AI Parse Result:', aiData);

      if (aiData) {
        // Map AI result to our structure
        const extractedData = {
          firstName: aiData.firstName || 'Candidate',
          lastName: aiData.lastName || 'Unknown',
          email: aiData.email || '',
          phone: aiData.phone || '',
          linkedIn: aiData.linkedIn || '',
          experience: aiData.experience || '',
          summary: text.substring(0, 500) // First 500 chars as summary preview
        };

        return res.json({ success: true, data: extractedData });
      }
    } catch (aiError) {
      console.error('⚠️ AI Parsing failed, falling back to basic extraction:', aiError);
      // Fallback logic continues below if AI fails...
    }

    // --- FALLBACK REGEX LOGIC (Original Implementation) ---
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);

    // ... (rest of the original regex logic for experience, etc.) ...

    // Refined heuristic for Experience: extract "X years" or "X.Y years"
    console.log('--- Parsing Experience (Fallback) ---');
    const yearRegex = /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?|yr)/gi;
    const yearMatches = Array.from(text.matchAll(yearRegex));
    let experienceString = '';

    if (yearMatches.length > 0) {
      const validMatches = yearMatches.filter(m => {
        const num = parseFloat(m[1]);
        return num < 50 && num > 0;
      });
      if (validMatches.length > 0) {
        const maxExp = validMatches.reduce((max, current) => {
          return parseFloat(current[1]) > parseFloat(max[1]) ? current : max;
        }, validMatches[0]);
        experienceString = `${maxExp[1]} years`;
      }
    }

    // Find LinkedIn URL
    const urls = text.match(urlRegex) || [];
    const linkedInUrl = urls.find(url => url.toLowerCase().includes('linkedin.com'));

    // Name Extraction Heuristic
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let potentialName = '';
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (!line.includes('@') && !line.match(/\d/) && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
        potentialName = line;
        break;
      }
    }
    if (!potentialName) {
      potentialName = file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }

    const nameParts = potentialName.split(' ');
    const firstName = nameParts[0] || 'Candidate';
    const lastName = nameParts.slice(1).join(' ') || '';

    const extractedData = {
      firstName,
      lastName,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      linkedIn: linkedInUrl || '',
      experience: experienceString || '',
      summary: text.substring(0, 500)
    };

    res.json({ success: true, data: extractedData });

  } catch (error: any) {
    console.error('Resume parse error:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

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

    // Extract text for AI parsing
    let text = '';
    try {
      if (file.mimetype === 'application/pdf') {
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const data = await pdfParse(file.buffer);
        text = data.text;
      } else if (file.mimetype === 'text/plain') {
        text = file.buffer.toString('utf-8');
      } else if (
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        try {
          const doc = await extractor.extract(file.buffer);
          text = doc.getBody();
        } catch (e) {
          console.error('Word parse error in upload:', e);
        }
      }
    } catch (err) {
      console.error('Text extraction failed:', err);
    }

    // Parse resume using AI service
    let candidateData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experience: '',
    };

    if (text) {
      try {
        console.log('🤖 Parsing uploaded resume with AI...');
        const aiData = await aiService.parseResume(text.substring(0, 15000));
        if (aiData) {
          candidateData = {
            firstName: aiData.firstName || '',
            lastName: aiData.lastName || '',
            email: aiData.email || '',
            phone: aiData.phone || '',
            experience: aiData.experience || '',
          };
          console.log('✅ AI Extract for Upload:', candidateData);
        }
      } catch (aiError) {
        console.error('AI parsing in upload failed:', aiError);
      }
    }

    // Fallback: extract name from filename if AI failed to get name
    if (!candidateData.firstName) {
      const fileName = file.originalname.replace(/\.[^/.]+$/, '');
      const nameParts = fileName.split(/[-_\s]+/);
      candidateData.firstName = nameParts[0] || 'Unknown';
      candidateData.lastName = nameParts.slice(1).join(' ') || 'Candidate';
    }

    const firstName = candidateData.firstName;
    const lastName = candidateData.lastName;
    const email = candidateData.email; // Now populated from AI!

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
      experience: candidateData.experience || '',
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
    // Filter by createdBy to restrict access to the logged-in user
    const candidates = await Candidate.find({ createdBy: (req as any).user.id })
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });

    // Fetch all candidate results
    const results = await CandidateResult.find({});

    // Map results to candidates (fuzzy match by name)
    const candidatesWithResults = await Promise.all(candidates.map(async (candidate) => {
      const candidateObj = candidate.toObject();
      const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();

      // Generate signed URL for resume if present
      if (candidate.resumeS3Key) {
        try {
          const signedUrl = await getSignedDownloadUrl(candidate.resumeS3Key);
          (candidateObj as any).resumeUrl = signedUrl;
        } catch (err) {
          console.error('Failed to generate signed URL for resume:', err);
        }
      }

      const candidateId = candidate._id.toString();

      const result = results.find((r: any) => {
        // 1. Try strict ID match (Highest confidence as per user request)
        // User confirmed: candidate_result "candidate_id" (or "id") matches candidate "_id"
        // Also handling 'candidate_id' (snake_case) as seen in user data
        // Handle potentially double-quoted ID string in DB e.g., "\"abc\""
        const rCandidateId = r.candidateId || r.id || r.candidate_id;
        const cleanRCandidateId = rCandidateId ? String(rCandidateId).replace(/^"|"$/g, '') : null;

        if (cleanRCandidateId === candidateId) {
          return true;
        }

        // 2. Fallback to Email match
        const candidateEmail = candidate.email?.toLowerCase();
        // Check both root and nested data structure
        const rEmail = r.candidateInformation?.email?.toLowerCase() || r.data?.candidateInformation?.email?.toLowerCase();

        if (candidateEmail && rEmail === candidateEmail) {
          return true;
        }

        // 3. Fallback to Name match
        const rName = r.candidateInformation?.fullName?.toLowerCase() || r.data?.candidateInformation?.fullName?.toLowerCase();
        return rName && (rName.includes(fullName) || fullName.includes(rName));
      });

      if (result) {
        (candidateObj as any).interviewAnalysis = result;
        // Ensure status reflects readiness
        (candidateObj as any).status = 'ai_analysis_ready';
      }

      return candidateObj;
    }));

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

    // Check ownership
    // Ensure we handle both populated object and direct ID (though it should be populated here)
    const creatorId = (candidate.createdBy as any)?._id?.toString() || (candidate.createdBy as any)?.toString();
    if (creatorId && creatorId !== (req as any).user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this candidate' });
    }

    // Fetch matching result using fuzzy search on name
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();

    // Find matching result in candidate_result collection
    // We try to match by name since we might not have a direct link yet
    // Handle potentially double-quoted ID string in DB e.g., "\"abc\""
    const candidateIdStr = candidate._id.toString();
    const quotedCandidateIdStr = `"${candidateIdStr}"`;

    const results = await CandidateResult.find({
      $or: [
        { 'candidateInformation.fullName': { $exists: true } },
        { 'data.candidateInformation.fullName': { $exists: true } },
        { 'id': candidateIdStr },
        { 'id': quotedCandidateIdStr },
        { 'candidateId': candidateIdStr },
        { 'candidateId': quotedCandidateIdStr },
        { 'candidate_id': candidateIdStr },
        { 'candidate_id': quotedCandidateIdStr }
      ]
    });

    const candidateId = candidateIdStr;
    const candidateEmail = candidate.email?.toLowerCase();

    const result = results.find(r => {
      // 1. Try strict ID match (Highest confidence)
      // Handle potentially double-quoted ID string in DB e.g., "\"abc\""
      const rCandidateId = r.candidateId || r.id || (r as any).candidate_id;
      const cleanRCandidateId = rCandidateId ? String(rCandidateId).replace(/^"|"$/g, '') : null;

      if (cleanRCandidateId === candidateId) {
        return true;
      }

      // 2. Try strict Email match
      const rEmail = r.candidateInformation?.email?.toLowerCase();
      if (candidateEmail && rEmail === candidateEmail) {
        return true;
      }

      // 3. Fallback to Name match
      const rName = r.candidateInformation?.fullName?.toLowerCase();
      return rName && (rName.includes(fullName) || fullName.includes(rName));
    });

    // Generate signed URL for resume if present
    if (candidate.resumeS3Key) {
      try {
        const signedUrl = await getSignedDownloadUrl(candidate.resumeS3Key);
        candidate.resumeUrl = signedUrl;
      } catch (err) {
        console.error('Failed to generate signed URL for resume:', err);
      }
    }

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
router.post('/', authenticate, upload.single('resume'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, experience, jobId, linkedInUrl } = req.body;

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

    // Handle Resume Upload to S3 if file is present
    let resumeUrl = '';
    let resumeS3Key = '';
    let resumeText = '';

    if (req.file) {
      try {
        const uploadResult = await uploadToS3(
          req.file.buffer,
          process.env.AWS_S3_RESUMES_FOLDER || 'resumes',
          `${firstName}_${lastName}_${req.file.originalname}`.replace(/\s+/g, '_'),
          req.file.mimetype
        );
        resumeUrl = uploadResult.url;
        resumeS3Key = uploadResult.key;

        // Extract Text for DNA Matching
        try {
          if (req.file.mimetype === 'application/pdf') {
            const pdfParse = (pdfParseModule as any).default || pdfParseModule;
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text;
          } else if (req.file.mimetype === 'text/plain') {
            resumeText = req.file.buffer.toString('utf-8');
          } else if (
            req.file.mimetype === 'application/msword' ||
            req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            const doc = await extractor.extract(req.file.buffer);
            resumeText = doc.getBody();
          }
        } catch (extractErr) {
          console.error('Failed to extract text for DNA matching:', extractErr);
        }

      } catch (uploadError) {
        console.error('Failed to upload resume to S3 during creation:', uploadError);
      }
    }

    // DNA Matching
    let resumeMatchScore = 0;
    let resumeMatchAnalysis = undefined;

    if (resumeText && job.description) {
      try {
        console.log('🧬 Calculating Resume DNA Match...');
        const matchResult = await aiService.calculateResumeMatch(
          resumeText,
          job.description,
          job.jobDNA // Assuming jobDNA is stored on Job model
        );
        resumeMatchScore = matchResult.score;
        resumeMatchAnalysis = matchResult;
      } catch (matchErr) {
        console.error('DNA Matching failed:', matchErr);
      }
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
      experience: experience || '',
      jobId,
      linkedInUrl,
      resumeUrl,
      resumeS3Key,
      interviewCode,
      interviewCodeExpiry,
      interviewStatus: 'invited',
      createdBy: (req as any).user.id,
      resumeMatchScore,
      resumeMatchAnalysis
    });

    await candidate.save();

    // Generate interview link
    const interviewLink = `${process.env.FRONTEND_URL}/interview?code=${interviewCode}`;

    // Auto-update status if match is high? (Optional, maybe keep as invited)

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

// Send feedback email (public/protected) - Sends specific form data to N8N webhook
router.post('/:id/send-feedback', async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message, feedbackType } = req.body;

    // We can also fetch the candidate to get some job details if needed, 
    // but the user wants to send the data *from the page form*.

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    const payload = {
      firstName,
      lastName,
      email,
      subject,
      message,
      feedbackType,
      candidateId: req.params.id
    };

    console.log('📨 Sending feedback email payload to N8N:', payload);

    // Use n8nService to send this specific payload
    // We cast payload to any because it doesn't match the strict InterviewResultPayload interface,
    // but axios/n8n won't care as long as it's JSON.
    await n8nService.sendInterviewResult(payload as any);

    res.json({ success: true, message: 'Feedback sent successfully' });
  } catch (error: any) {
    console.error('Send feedback error:', error);
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

// Update candidate details (protected)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, experience, linkedInUrl, additionalNotes } = req.body;

    // Find candidate to ensure ownership and existence
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check ownership
    if (candidate.createdBy && candidate.createdBy.toString() !== (req as any).user.id) {
      return res.status(403).json({ error: 'You do not have permission to update this candidate' });
    }

    // If email is changing, check uniqueness for this job
    if (email && email !== candidate.email) {
      const existing = await Candidate.findOne({ email, jobId: candidate.jobId, _id: { $ne: candidate._id } });
      if (existing) {
        return res.status(400).json({ error: 'Another candidate with this email already exists for this job' });
      }
      candidate.email = email;
    }

    if (firstName) candidate.firstName = firstName;
    if (lastName) candidate.lastName = lastName;
    if (phone !== undefined) candidate.phone = phone;
    if (experience !== undefined) candidate.experience = experience;
    if (linkedInUrl !== undefined) candidate.linkedInUrl = linkedInUrl;
    if (additionalNotes !== undefined) candidate.additionalNotes = additionalNotes;

    await candidate.save();
    res.json(candidate);
  } catch (error: any) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
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

// Manual save analysis result (protected) - Custom endpoint for user
router.post('/:id/analysis', authenticate, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const analysisData = req.body;

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check ownership
    if (candidate.createdBy && candidate.createdBy.toString() !== (req as any).user.id) {
      return res.status(403).json({ error: 'You do not have permission to update this candidate' });
    }

    // Check if result exists, update or create
    let result = await CandidateResult.findOne({
      $or: [
        { candidateId: candidateId },
        { id: candidateId },
        { candidate_id: candidateId }
      ]
    });

    if (result) {
      // Update existing
      Object.assign(result, analysisData);
      await result.save();
    } else {
      // Create new
      result = new CandidateResult({
        ...analysisData,
        candidateId: candidateId
      });
      await result.save();
    }

    // Also update candidate status and analysis data
    candidate.status = 'ai_analysis_ready';

    // Handle nested data for analysis update
    const source = (result as any).data || result;
    const assessment = source.competencyAssessment || source.overallAssessment || {};
    const rec = source.recommendation || source.overallAssessment || {};

    const parseScore = (val: any): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        if (val.includes('/')) {
          const [actual, total] = val.split('/').map(s => parseFloat(s.trim()));
          if (!isNaN(actual) && !isNaN(total) && total !== 0) {
            return Math.round((actual / total) * 100);
          }
        }
        return parseFloat(val) || 0;
      }
      return 0;
    };

    candidate.analysis = {
      overallScore: parseScore(assessment.overallScore || assessment.rating || source.overallScore),
      technicalSkills: assessment.technicalSkills || source.technicalSkills || {},
      communication: assessment.communication || source.communication || {},
      problemSolving: assessment.problemSolving || source.problemSolving || {},
      culturalFit: assessment.culturalFit || source.culturalFit || {},
      recommendation: rec.hiringRecommendation || source.recommendation || '',
      summary: source.executiveSummary || assessment.summary || source.summary || '',
      keyInsights: source.keyInsights || [],
      redFlags: source.redFlags || source.areasOfConcern || source.keyDiscussionPoints?.redFlags || []
    };
    await candidate.save();

    res.json({ success: true, message: 'Analysis saved successfully', data: result });
  } catch (error: any) {
    console.error('Save analysis error:', error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

// Webhook: Auto-sync candidate result (PUBLIC - called by n8n/external service)
// POST /api/candidate/webhook/result
router.post('/webhook/result', async (req, res) => {
  try {
    const { candidate_id, data } = req.body;

    console.log('📥 Webhook received for candidate_id:', candidate_id);

    if (!candidate_id) {
      return res.status(400).json({ error: 'candidate_id is required' });
    }

    // Find the candidate
    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      console.log('❌ Candidate not found:', candidate_id);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('✅ Found candidate:', candidate.firstName, candidate.lastName);

    // Save to CandidateResult collection
    let result = await CandidateResult.findOne({ candidate_id: candidate_id });
    if (result) {
      // Update existing
      (result as any).data = data;
      (result as any).candidate_id = candidate_id;
      await result.save();
      console.log('📝 Updated existing CandidateResult');
    } else {
      // Create new
      result = new CandidateResult({
        candidate_id: candidate_id,
        data: data,
        ...data // Also spread data at root level for backward compatibility
      });
      await result.save();
      console.log('📝 Created new CandidateResult');
    }

    // Parse score helper
    const parseScore = (val: any): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        if (val.includes('/')) {
          const [actual, total] = val.split('/').map(s => parseFloat(s.trim()));
          if (!isNaN(actual) && !isNaN(total) && total !== 0) {
            return Math.round((actual / total) * 100);
          }
        }
        return parseFloat(val) || 0;
      }
      return 0;
    };

    // Extract and sync analysis to candidate
    const dataObj = data || {};
    const assessment = dataObj.competencyAssessment || dataObj.overallAssessment || {};
    const rec = dataObj.recommendation || {};

    candidate.analysis = {
      overallScore: parseScore(assessment.overallScore || assessment.rating),
      technicalSkills: assessment.technicalSkills || {},
      communication: assessment.communication || {},
      problemSolving: assessment.problemSolving || {},
      culturalFit: assessment.culturalFit || {},
      recommendation: rec.hiringRecommendation || rec.decision || '',
      summary: dataObj.executiveSummary || assessment.summary || '',
      keyInsights: dataObj.strengthsObserved || [],
      redFlags: dataObj.areasOfConcern || dataObj.keyDiscussionPoints?.redFlags || []
    };

    candidate.status = 'ai_analysis_ready';
    await candidate.save();

    console.log('✅ Analysis synced to candidate:', candidate.firstName, candidate.lastName);

    res.json({
      success: true,
      message: 'Result saved and synced to candidate',
      candidateId: candidate_id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Sync all CandidateResults to Candidates by candidate_id (protected)
router.post('/sync-analysis', authenticate, async (_req, res) => {
  try {
    // Fetch all CandidateResults that have candidate_id field
    const results = await CandidateResult.find({});

    console.log(`📊 Found ${results.length} CandidateResults total`);

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    const parseScore = (val: any): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        if (val.includes('/')) {
          const [actual, total] = val.split('/').map(s => parseFloat(s.trim()));
          if (!isNaN(actual) && !isNaN(total) && total !== 0) {
            return Math.round((actual / total) * 100);
          }
        }
        return parseFloat(val) || 0;
      }
      return 0;
    };

    for (const result of results) {
      try {
        const resultData = result as any;

        // Get candidate_id from root level (snake_case as per user's data)
        const candidateId = resultData.candidate_id;

        if (!candidateId) {
          console.log('⚠️ No candidate_id in result, skipping');
          continue;
        }

        console.log(`🔍 Looking for candidate with ID: ${candidateId}`);

        // Find candidate by _id
        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
          errors.push(`Candidate not found for ID: ${candidateId}`);
          failed++;
          continue;
        }

        console.log(`🔗 Found candidate: ${candidate.firstName} ${candidate.lastName}`);

        // Extract analysis data from nested 'data' object
        const dataObj = resultData.data || resultData;
        const assessment = dataObj.competencyAssessment || dataObj.overallAssessment || {};
        const rec = dataObj.recommendation || {};

        candidate.analysis = {
          overallScore: parseScore(assessment.overallScore || assessment.rating),
          technicalSkills: assessment.technicalSkills || {},
          communication: assessment.communication || {},
          problemSolving: assessment.problemSolving || {},
          culturalFit: assessment.culturalFit || {},
          recommendation: rec.hiringRecommendation || rec.decision || '',
          summary: dataObj.executiveSummary || assessment.summary || '',
          keyInsights: dataObj.strengthsObserved || [],
          redFlags: dataObj.areasOfConcern || dataObj.keyDiscussionPoints?.redFlags || []
        };

        candidate.status = 'ai_analysis_ready';
        await candidate.save();

        console.log(`✅ Synced analysis for: ${candidate.firstName} ${candidate.lastName}`);
        synced++;
      } catch (err: any) {
        console.error('Sync error:', err.message);
        errors.push(err.message);
        failed++;
      }
    }

    res.json({
      success: true,
      message: `Synced ${synced} candidates, ${failed} failed`,
      synced,
      failed,
      errors: errors.slice(0, 10) // Show first 10 errors only
    });
  } catch (error: any) {
    console.error('Sync analysis error:', error);
    res.status(500).json({ error: 'Failed to sync analysis' });
  }
});

// Sync single candidate analysis by candidateId (protected)
router.post('/:id/sync-analysis', authenticate, async (req, res) => {
  try {
    const candidateId = req.params.id;

    // Find candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Find matching CandidateResult by candidateId
    const result = await CandidateResult.findOne({
      $or: [
        { candidateId: candidateId },
        { candidateId: `"${candidateId}"` },
        { id: candidateId },
        { candidate_id: candidateId }
      ]
    });

    if (!result) {
      return res.status(404).json({ error: 'No analysis result found for this candidate' });
    }

    const parseScore = (val: any): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        if (val.includes('/')) {
          const [actual, total] = val.split('/').map(s => parseFloat(s.trim()));
          if (!isNaN(actual) && !isNaN(total) && total !== 0) {
            return Math.round((actual / total) * 100);
          }
        }
        return parseFloat(val) || 0;
      }
      return 0;
    };

    // Extract and sync analysis data
    const source = (result as any).data || result;
    const assessment = source.competencyAssessment || source.overallAssessment || {};
    const rec = source.recommendation || source.overallAssessment || {};

    candidate.analysis = {
      overallScore: parseScore(assessment.overallScore || assessment.rating || source.overallScore),
      technicalSkills: assessment.technicalSkills || source.technicalSkills || {},
      communication: assessment.communication || source.communication || {},
      problemSolving: assessment.problemSolving || source.problemSolving || {},
      culturalFit: assessment.culturalFit || source.culturalFit || {},
      recommendation: rec.hiringRecommendation || source.recommendation || '',
      summary: source.executiveSummary || assessment.summary || source.summary || '',
      keyInsights: source.keyInsights || [],
      redFlags: source.redFlags || source.areasOfConcern || source.keyDiscussionPoints?.redFlags || []
    };

    candidate.status = 'ai_analysis_ready';
    await candidate.save();

    res.json({
      success: true,
      message: 'Analysis synced successfully',
      candidate: {
        id: candidate._id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        analysis: candidate.analysis
      }
    });
  } catch (error: any) {
    console.error('Sync single analysis error:', error);
    res.status(500).json({ error: 'Failed to sync analysis' });
  }
});

export default router;
