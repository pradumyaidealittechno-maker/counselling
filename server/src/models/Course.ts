import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    fees: number;
    currency: string;
    instructor?: string;
    syllabus?: {
        weeks: number;
        topics: string[];
    };
    thumbnail?: string;
    status: 'draft' | 'published' | 'archived';
    enrolledStudentsCount: number;
    rating: number;
    createdBy: mongoose.Types.ObjectId;
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    fees: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    instructor: { type: String },
    syllabus: {
        weeks: { type: Number },
        topics: [{ type: String }]
    },
    thumbnail: { type: String },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    enrolledStudentsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

export default mongoose.model<ICourse>('Course', CourseSchema);
