import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string;
    contextFileContent?: string;
    audioUrl?: string;
    audioTranscript?: string;
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
    prerequisites: { type: String },
    contextFileContent: { type: String },
    audioUrl: { type: String },
    audioTranscript: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

export default mongoose.model<ICourse>('Course', CourseSchema);
