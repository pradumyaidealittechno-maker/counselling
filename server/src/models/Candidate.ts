import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumeS3Key?: string;
  linkedInUrl?: string;
  jobId: mongoose.Types.ObjectId;
  interviewCode: string;
  interviewCodeExpiry: Date;
  interviewStatus: 'pending' | 'invited' | 'in_progress' | 'completed' | 'expired';
  interviewStartedAt?: Date;
  interviewCompletedAt?: Date;
  interviewAttempts: number;
  hasAccessedInterview: boolean;
  recordingUrl?: string;
  recordingS3Key?: string;
  transcript: Array<{
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  analysis?: {
    overallScore: number;
    technicalSkills: any;
    communication: any;
    problemSolving: any;
    culturalFit: any;
    recommendation: string;
    summary: string;
    keyInsights: string[];
    redFlags: string[];
  };
  finalDecision?: 'hired' | 'rejected' | 'pending';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    resumeUrl: String,
    resumeS3Key: String,
    linkedInUrl: String,
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    interviewCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    interviewCodeExpiry: {
      type: Date,
      required: true,
    },
    interviewStatus: {
      type: String,
      enum: ['pending', 'invited', 'in_progress', 'completed', 'expired'],
      default: 'pending',
    },
    interviewStartedAt: Date,
    interviewCompletedAt: Date,
    interviewAttempts: {
      type: Number,
      default: 0,
    },
    hasAccessedInterview: {
      type: Boolean,
      default: false,
    },
    recordingUrl: String,
    recordingS3Key: String,
    transcript: [
      {
        speaker: String,
        text: String,
        timestamp: String,
      },
    ],
    analysis: {
      overallScore: Number,
      technicalSkills: Schema.Types.Mixed,
      communication: Schema.Types.Mixed,
      problemSolving: Schema.Types.Mixed,
      culturalFit: Schema.Types.Mixed,
      recommendation: String,
      summary: String,
      keyInsights: [String],
      redFlags: [String],
    },
    finalDecision: {
      type: String,
      enum: ['hired', 'rejected', 'pending'],
    },
    notes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

candidateSchema.index({ email: 1, jobId: 1 });
candidateSchema.index({ interviewCode: 1 }, { unique: true });

export default mongoose.model<ICandidate>('Candidate', candidateSchema);
