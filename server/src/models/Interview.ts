import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface TranscriptEntry {
  speaker: 'ai' | 'candidate';
  text: string;
  timestamp: number;
  questionId?: mongoose.Types.ObjectId;
}

interface Recording {
  questionId?: mongoose.Types.ObjectId;
  videoUrl: string;
  audioUrl?: string;
  duration: number;
  uploadedAt: Date;
}

interface Response {
  questionId: mongoose.Types.ObjectId;
  transcribedText: string;
  duration: number;
  sentiment?: Record<string, unknown>;
  keywords?: string[];
}

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  
  // Invitation
  invitation: {
    code: string;
    sentAt?: Date;
    sentBy?: mongoose.Types.ObjectId;
    expiresAt: Date;
    remindersSent: number;
    isUsed: boolean;
  };
  
  // Interview session
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  
  // Recordings
  recordings: Recording[];
  fullRecordingUrl?: string;
  
  // Transcription
  transcript: TranscriptEntry[];
  
  // Responses
  responses: Response[];
  
  // Retell AI data
  retellCallId?: string;
  retellData?: Record<string, unknown>;
  
  // Technical data
  browserInfo?: Record<string, unknown>;
  ipAddress?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
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
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    invitation: {
      code: {
        type: String,
        unique: true,
        default: () => uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase(),
      },
      sentAt: Date,
      sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
      expiresAt: {
        type: Date,
        required: true,
      },
      remindersSent: {
        type: Number,
        default: 0,
      },
      isUsed: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'expired', 'cancelled'],
      default: 'pending',
    },
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    recordings: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion' },
        videoUrl: String,
        audioUrl: String,
        duration: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    fullRecordingUrl: String,
    transcript: [
      {
        speaker: { type: String, enum: ['ai', 'candidate'] },
        text: String,
        timestamp: Number,
        questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion' },
      },
    ],
    responses: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion' },
        transcribedText: String,
        duration: Number,
        sentiment: Schema.Types.Mixed,
        keywords: [String],
      },
    ],
    retellCallId: String,
    retellData: Schema.Types.Mixed,
    browserInfo: Schema.Types.Mixed,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
interviewSchema.index({ 'invitation.code': 1 }, { unique: true });
interviewSchema.index({ candidateId: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ 'invitation.expiresAt': 1 });

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
