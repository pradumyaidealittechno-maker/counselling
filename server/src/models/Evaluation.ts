import mongoose, { Document, Schema } from 'mongoose';

interface TraitEvaluation {
  traitId: string;
  trait: string;
  dimension: string;
  importance: 'High' | 'Medium' | 'Low';
  score: number;
  evidence: string[];
  transcriptExcerpts?: Array<{ text: string; timestamp: string }>;
}

interface DimensionEvaluation {
  dimension: string;
  overallScore: number;
  traitEvaluations: TraitEvaluation[];
  strengths: string[];
  gaps: string[];
  impact: 'positive' | 'neutral' | 'negative';
}

export interface IEvaluation extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  
  // AI Recommendation
  recommendation: {
   
    
    confidence: number;
    overallScore: number;
  };
  
  // Dimension evaluations
  dimensionEvaluations: {
    skillDNA?: DimensionEvaluation;
    experienceDNA?: DimensionEvaluation;
    behavioralDNA?: DimensionEvaluation;
    communicationDNA?: DimensionEvaluation;
    culturalDNA?: DimensionEvaluation;
  };
  
  // Summary
  summary: string;
  keyStrengths: string[];
  keyConcerns: string[];
  
  // Comparison
  comparisonToOtherCandidates?: {
    percentile: number;
    totalCandidates: number;
  };
  
  // Raw AI response
  rawAIResponse?: Record<string, unknown>;
  
  // AI metadata
  aiModel: string;
  processingTime: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    recommendation: {
      decision: {
        type: String,
        enum: ['Hire', 'Hold', 'Reject'],
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    dimensionEvaluations: {
      skillDNA: Schema.Types.Mixed,
      experienceDNA: Schema.Types.Mixed,
      behavioralDNA: Schema.Types.Mixed,
      communicationDNA: Schema.Types.Mixed,
      culturalDNA: Schema.Types.Mixed,
    },
    summary: {
      type: String,
      required: true,
    },
    keyStrengths: [String],
    keyConcerns: [String],
    comparisonToOtherCandidates: {
      percentile: Number,
      totalCandidates: Number,
    },
    rawAIResponse: Schema.Types.Mixed,
    aiModel: {
      type: String,
      default: 'gpt-4',
    },
    processingTime: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes
evaluationSchema.index({ candidateId: 1 });
evaluationSchema.index({ jobId: 1 });
evaluationSchema.index({ 'recommendation.decision': 1 });
evaluationSchema.index({ 'recommendation.overallScore': -1 });

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
