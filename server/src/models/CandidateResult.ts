import mongoose from 'mongoose';

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

export const CandidateResult = mongoose.model('CandidateResult', candidateResultSchema);
