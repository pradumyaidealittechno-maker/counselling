import mongoose, { Document, Schema } from 'mongoose';

export interface ICounsellingSession extends Document {
    sessionId: string; // Unique human-readable or external ID
    studentId: mongoose.Types.ObjectId;
    counsellorId: mongoose.Types.ObjectId;

    // Session Details
    sessionType: 'academic' | 'career' | 'personal' | 'assessment' | 'follow-up';
    sessionMode: 'voice' | 'video' | 'chat' | 'in-person';

    // Scheduling
    scheduledAt: Date;
    duration: number; // minutes
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

    // Integration
    sessionCode?: string;
    recordingUrl?: string;
    retellCallId?: string;

    // Analysis
    transcript: {
        speaker: 'counsellor' | 'student' | 'ai';
        text: string;
        timestamp: Date;
    }[];

    aiAssisted: boolean;
    aiSuggestions: string[];

    // Notes & Outcomes
    agenda: string[];
    discussionPoints: string[];
    actionItems: {
        item: string;
        dueDate?: Date;
        status: 'pending' | 'in_progress' | 'completed';
    }[];

    sessionSummary: string;
    counsellorNotes: string;
    studentFeedback?: {
        rating: number;
        comments: string;
    };

    followUpRequired: boolean;
    followUpDate?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new Schema<ICounsellingSession>(
    {
        sessionId: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        counsellorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        sessionType: {
            type: String,
            enum: ['academic', 'career', 'personal', 'assessment', 'follow-up'],
            required: true
        },
        sessionMode: {
            type: String,
            enum: ['voice', 'video', 'chat', 'in-person'],
            default: 'video'
        },

        scheduledAt: { type: Date, required: true },
        duration: { type: Number, default: 45 },
        status: {
            type: String,
            enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
            default: 'scheduled'
        },

        sessionCode: String,
        recordingUrl: String,
        retellCallId: String,

        transcript: [{
            speaker: { type: String, enum: ['counsellor', 'student', 'ai'] },
            text: String,
            timestamp: Date
        }],

        aiAssisted: { type: Boolean, default: false },
        aiSuggestions: [String],

        agenda: [String],
        discussionPoints: [String],
        actionItems: [{
            item: String,
            dueDate: Date,
            status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' }
        }],

        sessionSummary: String,
        counsellorNotes: String,
        studentFeedback: {
            rating: Number,
            comments: String
        },

        followUpRequired: { type: Boolean, default: false },
        followUpDate: Date
    },
    { timestamps: true }
);

export const CounsellingSession = mongoose.models.CounsellingSession || mongoose.model<ICounsellingSession>('CounsellingSession', sessionSchema);
export default CounsellingSession;
