import mongoose, { Document, Schema } from 'mongoose';

export interface ICounsellingResource extends Document {
    title: string;
    description: string;
    type: 'Article' | 'Video' | 'PDF' | 'Link' | 'Document';
    category: 'Exam Prep' | 'College Info' | 'Career Guidance' | 'Applications' | 'Skill Development';

    content?: string;
    fileUrl?: string;
    externalUrl?: string;

    tags: string[];
    targetAudience: string[]; // e.g., "10th", "12th", "Engineering"

    isPublic: boolean; // Visible to all students?
    uploadedBy: mongoose.Types.ObjectId;

    stats: {
        views: number;
        downloads: number;
    };

    createdAt: Date;
    updatedAt: Date;
}

const resourceSchema = new Schema<ICounsellingResource>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        type: {
            type: String,
            enum: ['Article', 'Video', 'PDF', 'Link', 'Document'],
            required: true
        },
        category: {
            type: String,
            enum: ['Exam Prep', 'College Info', 'Career Guidance', 'Applications', 'Skill Development'],
            required: true
        },

        content: String,
        fileUrl: String,
        externalUrl: String,

        tags: [String],
        targetAudience: [String],

        isPublic: { type: Boolean, default: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        stats: {
            views: { type: Number, default: 0 },
            downloads: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

export const CounsellingResource = mongoose.models.CounsellingResource || mongoose.model<ICounsellingResource>('CounsellingResource', resourceSchema);
export default CounsellingResource;
