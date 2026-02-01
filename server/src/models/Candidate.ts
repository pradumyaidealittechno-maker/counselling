import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  experience?: string;
  resumeUrl?: string;
  resumeS3Key?: string;
  linkedInUrl?: string;
  jobId: mongoose.Types.ObjectId;
  status: 'new' | 'resume_screened' | 'pending_interview' | 'interview_complete' | 'ai_analysis_ready' | 'decision_made' | 'hired' | 'rejected';
  resume?: {
    url: string;
    fileName: string;
    uploadedAt: Date;
  };
  interviewId?: mongoose.Types.ObjectId;
  interviewCode?: string;
  interviewCodeExpiry?: Date;
  interviewStatus: 'pending' | 'invited' | 'in_progress' | 'completed' | 'expired';
  interviewStartedAt?: Date;
  interviewCompletedAt?: Date;
  interviewDuration?: number;
  interviewAttempts: number;
  hasAccessedInterview: boolean;
  browserInfo?: Record<string, unknown>;
  recordingUrl?: string;
  recordingS3Key?: string;
  recordingUrls?: string[];
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
  resumeMatchScore?: number;
  resumeMatchAnalysis?: {
    score: number;
    matchExplanation: string;
    missingSkills: string[];
    matchingSkills: string[];
    recommendation: string;
  };
  finalDecision?: {
    decision: 'Hire' | 'Hold' | 'Reject';
    decidedBy?: string;
    decidedAt?: Date;
    notes?: string;
  };
  notes?: string;
  additionalNotes?: string;
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
    experience: {
      type: String,
      trim: true,
    },
    resume: {
      url: String,
      fileName: String,
      uploadedAt: Date,
    },
    resumeUrl: String, // Deprecated but kept for backward compatibility if needed
    resumeS3Key: String, // Deprecated
    linkedInUrl: String,
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'resume_screened', 'pending_interview', 'interview_complete', 'ai_analysis_ready', 'decision_made', 'hired', 'rejected'],
      default: 'new',
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
    },
    interviewCode: {
      type: String,
      uppercase: true,
    },
    interviewCodeExpiry: Date,
    interviewStatus: {
      type: String,
      enum: ['pending', 'invited', 'in_progress', 'completed', 'expired'],
      default: 'pending',
    },
    interviewStartedAt: Date,
    interviewCompletedAt: Date,
    interviewDuration: Number,
    interviewAttempts: {
      type: Number,
      default: 0,
    },
    hasAccessedInterview: {
      type: Boolean,
      default: false,
    },
    browserInfo: Schema.Types.Mixed,
    recordingUrl: String,
    recordingS3Key: String,
    recordingUrls: [String], // Array to store multiple recording chunks
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
    resumeMatchScore: Number,
    resumeMatchAnalysis: {
      score: Number,
      matchExplanation: String,
      missingSkills: [String],
      matchingSkills: [String],
      recommendation: String
    },
    finalDecision: {
      decision: {
        type: String,
        enum: ['Hire', 'Hold', 'Reject'],
      },
      decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      decidedAt: Date,
      notes: String,
    },
    notes: String,
    additionalNotes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Relaxed requirement as some flows might not have user immediately available or system created
    },
  },
  {
    timestamps: true,
  }
);

candidateSchema.index({ email: 1, jobId: 1 });
candidateSchema.index({ interviewCode: 1 }, { unique: true });

export default mongoose.model<ICandidate>('Candidate', candidateSchema);
