import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseRecommendation extends Document {
    studentId: mongoose.Types.ObjectId;
    counsellorId?: mongoose.Types.ObjectId;

    courseName: string;
    provider: string; // "Udemy", "Coursera", "Local Institute"
    url?: string;

    type: 'Academic' | 'Skill' | 'Entrance Exam' | 'College Application';
    priority: 'High' | 'Medium' | 'Low';

    reasoning: string;

    status: 'Recommended' | 'Enrolled' | 'Completed' | 'Dropped';
    progress?: number; // 0-100%

    startDate?: Date;
    completionDate?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const courseSchema = new Schema<ICourseRecommendation>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        counsellorId: { type: Schema.Types.ObjectId, ref: 'User' },

        courseName: { type: String, required: true },
        provider: String,
        url: String,

        type: {
            type: String,
            enum: ['Academic', 'Skill', 'Entrance Exam', 'College Application'],
            default: 'Academic'
        },
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium'
        },

        reasoning: String,

        status: {
            type: String,
            enum: ['Recommended', 'Enrolled', 'Completed', 'Dropped'],
            default: 'Recommended'
        },
        progress: { type: Number, default: 0 },

        startDate: Date,
        completionDate: Date
    },
    { timestamps: true }
);

export const CourseRecommendation = mongoose.models.CourseRecommendation || mongoose.model<ICourseRecommendation>('CourseRecommendation', courseSchema);
export default CourseRecommendation;
