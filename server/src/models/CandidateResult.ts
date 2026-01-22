import mongoose from 'mongoose';
import Candidate from './Candidate.js';

const candidateResultSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: false
  },
  candidateInformation: {
    fullName: String,
    email: String
  },
  overallAssessment: {
    rating: Number, // 0-10 or 0-100
    hiringRecommendation: String,
    summary: String
  },
  professionalProfile: {
    technicalStack: [String],
    yearsOfExperience: Number
  },
  keyDiscussionPoints: {
    technicalExperience: [String],
    softSkills: [String],
    redFlags: [String]
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
candidateResultSchema.post('save', async function(doc) {
  try {
    console.log('🔄 Syncing CandidateResult to Candidate...');
    console.log('📄 CandidateResult Doc:', JSON.stringify(doc.toObject(), null, 2));
    const result = doc as any;
    
    // Resolve candidateId (handle various field names used in the past)
    const candidateId = result.candidateId || result.candidate_id || result.id;
    
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

    // Update candidate analysis
    candidate.analysis = {
      overallScore: parseScore(assessment.overallScore || assessment.rating || dataObj.overallScore),
      technicalSkills: assessment.technicalSkills || dataObj.technicalSkills || {},
      communication: assessment.communication || dataObj.communication || {},
      problemSolving: assessment.problemSolving || dataObj.problemSolving || {},
      culturalFit: assessment.culturalFit || dataObj.culturalFit || {},
      recommendation: rec.hiringRecommendation || result.recommendation || '',
      summary: dataObj.executiveSummary || assessment.summary || dataObj.summary || '',
      keyInsights: dataObj.keyInsights || dataObj.strengthsObserved || [],
      redFlags: dataObj.redFlags || dataObj.areasOfConcern || dataObj.keyDiscussionPoints?.redFlags || []
    };

    candidate.status = 'ai_analysis_ready';
    await candidate.save();
    console.log(`✅ Candidate ${candidate._id} updated with analysis data`);

  } catch (error) {
    console.error('❌ Failed to sync CandidateResult to Candidate:', error);
  }
});

export const CandidateResult = mongoose.model('CandidateResult', candidateResultSchema);
