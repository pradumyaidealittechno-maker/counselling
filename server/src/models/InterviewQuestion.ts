import mongoose, { Document, Schema } from 'mongoose';

interface DNAMapping {
  traitId: string;
  trait: string;
  dimension: string;
  importance: 'High' | 'Medium' | 'Low';
  signalsToEvaluate: string[];
}

interface EvaluationCriteria {
  excellent: string;
  good: string;
  average: string;
  poor: string;
}

export interface IInterviewQuestion extends Document {
  jobId: mongoose.Types.ObjectId;
  text: string;
  category: 'technical' | 'behavioral' | 'situational' | 'communication';
  dnaMapping: DNAMapping[];
  estimatedDuration: number;
  followUpQuestions: string[];
  evaluationCriteria: EvaluationCriteria;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'communication'],
      required: true,
    },
    dnaMapping: [
      {
        traitId: String,
        trait: String,
        dimension: String,
        importance: { type: String, enum: ['High', 'Medium', 'Low'] },
        signalsToEvaluate: [String],
      },
    ],
    estimatedDuration: {
      type: Number,
      default: 120,
    },
    followUpQuestions: [String],
    evaluationCriteria: {
      excellent: String,
      good: String,
      average: String,
      poor: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

interviewQuestionSchema.index({ jobId: 1, order: 1 });

export const InterviewQuestion = mongoose.model<IInterviewQuestion>('InterviewQuestion', interviewQuestionSchema);
