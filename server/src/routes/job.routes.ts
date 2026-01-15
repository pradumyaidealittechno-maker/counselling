import express from 'express';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { authenticate } from '../middleware/auth.js';
import aiService from '../services/ai.service.js';
import n8nService from '../services/n8n.service.js';

const router = express.Router();

// Get all jobs (protected)
router.get('/', authenticate, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error: any) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job by ID (protected)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error: any) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create job (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    // Fetch the user to get their company information
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return res.status(400).json({ error: 'User is not associated with a company' });
    }

    const jobData = {
      ...req.body,
      company: company.name,
      createdBy: (req as any).user.id,
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json(job);
  } catch (error: any) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (protected)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error: any) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Generate Job DNA (protected)
router.post('/:id/generate-dna', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobDNA = await aiService.generateJobDNA(job.description);

    job.jobDNA = jobDNA;
    await job.save();

    res.json({ jobDNA });
  } catch (error: any) {
    console.error('Generate Job DNA error:', error);
    res.status(500).json({ error: 'Failed to generate Job DNA' });
  }
});

// Generate interview questions via AI (protected)
router.post('/:id/generate-questions', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('🎯 Generating questions for job:', job.title);
    console.log('📊 Job has DNA:', !!job.jobDNA);

    const questions = await aiService.generateInterviewQuestions({
      jobTitle: job.title,
      jobDescription: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      jobDNA: job.jobDNA,
    });

    console.log('✅ Generated questions count:', questions?.length || 0);

    // Update job with generated questions
    if (questions && Array.isArray(questions) && questions.length > 0) {
      job.interviewQuestions = questions;
      await job.save();
      console.log('💾 Saved questions to database');
    } else {
      console.warn('⚠️  No questions generated or empty array returned');
    }

    res.json({ questions: job.interviewQuestions });
  } catch (error: any) {
    console.error('Generate questions error:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

// Sync interview questions to n8n (protected)
router.post('/:id/sync-questions', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.interviewQuestions || job.interviewQuestions.length === 0) {
      console.warn('⚠️ No questions found for job:', job._id);
      return res.status(400).json({ error: 'No questions to sync' });
    }

    console.log('🔄 Syncing questions to n8n for job:', job.title, 'Count:', job.interviewQuestions.length);

    // Create a clean payload with all relevant job details
    const cleanQuestions = job.interviewQuestions.map((q: any) => {
      // Handle mongoose document if applicable, otherwise use plain object
      const plainQ = typeof q.toObject === 'function' ? q.toObject() : q;
      // Remove internal mongoose _id if id exists, or keep _id as string
      const { _id, ...rest } = plainQ;
      return { ...rest, id: plainQ.id || _id };
    });

    // Format questions as text
    const questionsText = job.interviewQuestions.map((q: any, index: number) => {
      return `${index + 1}. ${q.text}\n   [${q.category}] - Duration: ${Math.floor(q.estimatedDuration / 60)}m ${q.estimatedDuration % 60}s`;
    }).join('\n\n');

    const success = await n8nService.syncInterviewQuestions({
      jobTitle: job.title,
      jobDescription: job.description,  // Added context
      jobDNA: job.jobDNA,               // Added context
      questions: cleanQuestions,
      questionsText: questionsText      // Added formatted text
    });

    if (success) {
      res.json({ message: 'Questions synced successfully to n8n' });
    } else {
      res.status(500).json({ error: 'Failed to sync questions to n8n' });
    }
  } catch (error: any) {
    console.error('Sync questions error:', error);
    res.status(500).json({ error: 'Failed to sync questions' });
  }
});

// Get interview questions for a job (protected)
router.get('/:id/questions', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select('interviewQuestions title');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ questions: job.interviewQuestions || [] });
  } catch (error: any) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch interview questions' });
  }
});

// Add a new question to a job (protected)
router.post('/:id/questions', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const newQuestion = {
      id: req.body.id || `q${Date.now()}`,
      ...req.body
    };

    job.interviewQuestions.push(newQuestion);
    await job.save();

    res.status(201).json({ question: newQuestion });
  } catch (error: any) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Update a specific question (protected)
router.patch('/:id/questions/:questionId', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const questionIndex = job.interviewQuestions.findIndex(
      (q: any) => q.id === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update the question
    job.interviewQuestions[questionIndex] = {
      ...job.interviewQuestions[questionIndex],
      ...req.body,
      id: req.params.questionId // Preserve the ID
    };

    await job.save();

    res.json({ question: job.interviewQuestions[questionIndex] });
  } catch (error: any) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a specific question (protected)
router.delete('/:id/questions/:questionId', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const questionIndex = job.interviewQuestions.findIndex(
      (q: any) => q.id === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    job.interviewQuestions.splice(questionIndex, 1);
    await job.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Delete job (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete all candidates associated with this job
    await Candidate.deleteMany({ jobId: job._id });

    // Delete the job
    await job.deleteOne();

    res.json({ message: 'Job and associated candidates deleted successfully' });
  } catch (error: any) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Test question generation (protected) - for debugging
router.post('/:id/test-questions', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('🧪 TEST: Generating questions');
    console.log('Job Title:', job.title);
    console.log('Has Description:', !!job.description);
    console.log('Has DNA:', !!job.jobDNA);
    console.log('DNA Keys:', job.jobDNA ? Object.keys(job.jobDNA) : []);

    const questions = await aiService.generateInterviewQuestions({
      jobTitle: job.title,
      jobDescription: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      jobDNA: job.jobDNA,
    });

    console.log('🧪 TEST: Generated', questions?.length || 0, 'questions');

    res.json({
      test: true,
      questionsGenerated: questions?.length || 0,
      questions: questions,
      jobHasDNA: !!job.jobDNA,
      dnaKeys: job.jobDNA ? Object.keys(job.jobDNA) : []
    });
  } catch (error: any) {
    console.error('🧪 TEST: Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
