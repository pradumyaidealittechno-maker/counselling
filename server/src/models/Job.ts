import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  requiredSkills: string[];
  optionalSkills: string[];
  jobDNA: {
    skillDNA: Array<{
      id: string;
      name: string;
      description: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      signals: string[];
    }>;
    experienceDNA: Array<{
      id: string;
      name: string;
      description: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      signals: string[];
    }>;
    behavioralDNA: Array<{
      id: string;
      name: string;
      description: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      signals: string[];
    }>;
    communicationDNA: Array<{
      id: string;
      name: string;
      description: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      signals: string[];
    }>;
    culturalDNA: Array<{
      id: string;
      name: string;
      description: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      signals: string[];
    }>;
  };
  interviewQuestions: Array<{
    id: string;
    text: string;
    category: 'technical' | 'behavioral' | 'situational' | 'communication';
    estimatedDuration: number;
    dnaMapping: Array<{
      dimension: string;
      trait: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
      signalsToEvaluate: string[];
    }>;
    evaluationCriteria: {
      excellent: string;
      good: string;
      average: string;
      poor: string;
    };
    followUpQuestions?: string[];
  }>;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      required: true,
    },
    requiredSkills: [String],
    optionalSkills: [String],
    jobDNA: {
      skillDNA: [
        {
          id: String,
          name: String,
          description: String,
          importance: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          signals: [String],
        },
      ],
      experienceDNA: [
        {
          id: String,
          name: String,
          description: String,
          importance: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          signals: [String],
        },
      ],
      behavioralDNA: [
        {
          id: String,
          name: String,
          description: String,
          importance: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          signals: [String],
        },
      ],
      communicationDNA: [
        {
          id: String,
          name: String,
          description: String,
          importance: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          signals: [String],
        },
      ],
      culturalDNA: [
        {
          id: String,
          name: String,
          description: String,
          importance: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
          },
          signals: [String],
        },
      ],
    },
    interviewQuestions: [
      {
        id: String,
        text: String,
        category: {
          type: String,
          enum: ['technical', 'behavioral', 'situational', 'communication'],
        },
        estimatedDuration: Number,
        dnaMapping: [
          {
            dimension: String,
            trait: String,
            importance: {
              type: String,
              enum: ['critical', 'high', 'medium', 'low'],
            },
            signalsToEvaluate: [String],
          },
        ],
        evaluationCriteria: {
          excellent: String,
          good: String,
          average: String,
          poor: String,
        },
        followUpQuestions: [String],
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IJob>('Job', jobSchema);
