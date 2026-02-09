import mongoose from 'mongoose';
import Candidate from './Candidate.js';

// Schema for individual technical questions assessed
const technicalQuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  topic: String,
  question: String,
  candidateAnswer: String,
  correctness: String, // "Correct", "Partially Correct", "Incorrect"
  expectedKeyPoints: String,
  whatWasMissing: String,
  score: String // e.g., "6/10"
}, { _id: false });

// Schema for technical performance summary
const technicalPerformanceSummarySchema = new mongoose.Schema({
  totalQuestionsAsked: Number,
  correctAnswers: Number,
  partiallyCorrect: Number,
  incorrectAnswers: Number,
  notAnswered: Number,
  technicalAccuracyRate: String
}, { _id: false });

// Schema for technical question analysis
const technicalQuestionAnalysisSchema = new mongoose.Schema({
  questionsAssessed: [technicalQuestionSchema],
  technicalPerformanceSummary: technicalPerformanceSummarySchema
}, { _id: false });

// Schema for competency assessment scores
const competencyScoresSchema = new mongoose.Schema({
  technicalSkills: Number,
  communication: Number,
  problemSolving: Number,
  experienceRelevance: Number,
  culturalFit: Number,
  overallScore: Number
}, { _id: false });

// Schema for competency assessment details (pipe-formatted strings)
const competencyDetailsSchema = new mongoose.Schema({
  technicalSkills: String,
  communication: String,
  problemSolving: String,
  experienceRelevance: String,
  culturalFit: String
}, { _id: false });

// Schema for competency assessment
const competencyAssessmentSchema = new mongoose.Schema({
  scores: competencyScoresSchema,
  details: competencyDetailsSchema
}, { _id: false });

// Schema for recommendation
const recommendationSchema = new mongoose.Schema({
  hiringRecommendation: String, // "HIRE", "MAYBE", "NO HIRE"
  status: String, // "Further Review", "Approved", "Rejected"
  reasoning: String,
  nextSteps: [String]
}, { _id: false });

// Schema for additional notes
const additionalNotesSchema = new mongoose.Schema({
  interviewCompleteness: String,
  engagementLevel: String,
  salaryExpectations: String,
  availability: String,
  followUpRequired: String
}, { _id: false });

// Schema for metadata
const metadataSchema = new mongoose.Schema({
  reportGenerated: String,
  interviewType: String,
  interviewer: String
}, { _id: false });

// Main CandidateResult Schema
const candidateResultSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: false
  },

  // Candidate Information
  candidateInformation: {
    fullName: String,
    email: String,
    phone: String,
    positionAppliedFor: String,
    interviewDate: mongoose.Schema.Types.Mixed, // Can be Date or String
    interviewDuration: String
  },

  // Professional Profile
  professionalProfile: {
    totalExperience: String,
    experienceLevel: String, // "ENTRY (0-2 yrs)", "MID-LEVEL (3-5 yrs)", "SENIOR (5+ yrs)"
    currentRole: String,
    currentCompany: String,
    technicalStack: [String]
  },

  // Technical Question Analysis
  technicalQuestionAnalysis: technicalQuestionAnalysisSchema,

  // Key Discussion Points
  keyDiscussionPoints: {
    technicalExperience: [String],
    projectsDiscussed: [String],
    problemSolvingExamples: [String],
    softSkills: [String],
    redFlags: [String]
  },

  // Competency Assessment
  competencyAssessment: competencyAssessmentSchema,

  // Strengths and Concerns
  strengthsObserved: [String],
  areasOfConcern: [String],

  // Notable Quotes from candidate
  notableQuotes: [String],

  // Questions asked by candidate
  questionsAskedByCandidate: [String],

  // Recommendation
  recommendation: recommendationSchema,

  // Executive Summary
  executiveSummary: String,

  // Additional Notes
  additionalNotes: additionalNotesSchema,

  // Report Metadata
  metadata: metadataSchema,

  // Legacy fields for backward compatibility
  overallAssessment: {
    rating: Number,
    hiringRecommendation: String,
    summary: String
  },
  communicationSkills: {
    clarity: Number,
    conciseness: Number,
    listening: Number,
    overall: Number
  },
  culturalFit: {
    adaptability: Number,
    teamwork: Number,
    communication: Number
  },
  interviewDetails: {
    date: Date,
    duration: String,
    questionCount: Number
  }
}, {
  collection: 'candidate_result',
  strict: false,
  timestamps: true
});

// Post-save hook to sync analysis to Candidate
candidateResultSchema.post('save', async function (doc) {
  try {
    console.log('🔄 Syncing CandidateResult to Candidate...');
    console.log('📄 CandidateResult Doc:', JSON.stringify(doc.toObject(), null, 2));
    const result = doc as any;

    // Resolve candidateId (handle various field names used in the past)
    let candidateId = result.candidateId || result.candidate_id || result.id;

    // Clean quoted strings if present (N8N issue)
    if (candidateId && typeof candidateId === 'string') {
      candidateId = candidateId.replace(/^"|"$/g, '');
    }

    if (!candidateId) {
      console.log('⚠️ No candidateId found in result, skipping sync');
      return;
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.log(`⚠️ Candidate not found: ${candidateId}, skipping sync`);
      return;
    }

    // Helper to parse scores
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

    // Extract data
    const dataObj = result.data || result; // Handle if data is wrapped in 'data' prop or at root
    console.log('🔍 Extracted dataObj keys:', Object.keys(dataObj));

    const assessment = dataObj.competencyAssessment || dataObj.overallAssessment || {};
    console.log('📊 Assessment object found:', !!(dataObj.competencyAssessment || dataObj.overallAssessment), Object.keys(assessment));

    const rec = dataObj.recommendation || dataObj.overallAssessment || {};
    console.log('📝 Recommendation object found:', !!(dataObj.recommendation || dataObj.overallAssessment));

    // Extract scores from competencyAssessment
    const scores = assessment.scores || {};
    const details = assessment.details || assessment;

    // Calculate overall score from scores object or fallback to average
    let overallScore = 0;
    if (scores.overallScore !== undefined) {
      // If overallScore is a sum out of 50 (5 categories * 10)
      overallScore = typeof scores.overallScore === 'number'
        ? Math.round((scores.overallScore / 50) * 100)
        : parseScore(scores.overallScore);
    } else if (assessment.overallScore !== undefined) {
      overallScore = parseScore(assessment.overallScore);
    } else {
      // Calculate from individual scores
      const techScore = parseScore(scores.technicalSkills || details.technicalSkills);
      const commScore = parseScore(scores.communication || details.communication);
      const probScore = parseScore(scores.problemSolving || details.problemSolving);
      const expScore = parseScore(scores.experienceRelevance || details.experienceRelevance);
      const cultScore = parseScore(scores.culturalFit || details.culturalFit);
      overallScore = Math.round((techScore + commScore + probScore + expScore + cultScore) / 5);
    }

    // Update candidate analysis with comprehensive data
    candidate.analysis = {
      // Overall assessment
      overallScore,

      // Competency scores (prefer numeric from 'scores', fallback to details strings)
      technicalSkills: scores.technicalSkills || parseScore(details.technicalSkills) || 0,
      communication: scores.communication || parseScore(details.communication) || 0,
      problemSolving: scores.problemSolving || parseScore(details.problemSolving) || 0,
      experienceRelevance: scores.experienceRelevance || parseScore(details.experienceRelevance) || 0,
      culturalFit: scores.culturalFit || parseScore(details.culturalFit) || 0,

      // Competency details (pipe-formatted strings for evidence)
      competencyDetails: {
        technicalSkills: typeof details.technicalSkills === 'string' ? details.technicalSkills : '',
        communication: typeof details.communication === 'string' ? details.communication : '',
        problemSolving: typeof details.problemSolving === 'string' ? details.problemSolving : '',
        experienceRelevance: typeof details.experienceRelevance === 'string' ? details.experienceRelevance : '',
        culturalFit: typeof details.culturalFit === 'string' ? details.culturalFit : ''
      },

      // Recommendation
      recommendation: rec.hiringRecommendation || '',
      recommendationStatus: rec.status || '',
      recommendationReasoning: rec.reasoning || '',
      nextSteps: rec.nextSteps || [],

      // Summaries and insights
      summary: dataObj.executiveSummary || assessment.summary || dataObj.summary || '',
      keyInsights: dataObj.strengthsObserved || dataObj.keyInsights || [],
      redFlags: dataObj.areasOfConcern || dataObj.redFlags || dataObj.keyDiscussionPoints?.redFlags || [],

      // Detailed analysis sections
      technicalQuestionAnalysis: dataObj.technicalQuestionAnalysis || null,
      professionalProfile: dataObj.professionalProfile || null,
      keyDiscussionPoints: dataObj.keyDiscussionPoints || null,
      notableQuotes: dataObj.notableQuotes || [],
      questionsAskedByCandidate: dataObj.questionsAskedByCandidate || [],
      additionalNotes: dataObj.additionalNotes || null,
      metadata: dataObj.metadata || null
    };

    candidate.status = 'ai_analysis_ready';
    await candidate.save();
    console.log(`✅ Candidate ${candidate._id} updated with analysis data`);

  } catch (error) {
    console.error('❌ Failed to sync CandidateResult to Candidate:', error);
  }
});

export const CandidateResult = mongoose.model('CandidateResult', candidateResultSchema);
