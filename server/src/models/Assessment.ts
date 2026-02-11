import mongoose, { Document, Schema } from 'mongoose';

export interface IAssessment extends Document {
    studentId: mongoose.Types.ObjectId;
    counsellorId?: mongoose.Types.ObjectId;

    title: string;
    type: 'Aptitude' | 'Technical' | 'Personality' | 'Career';
    category: string;

    status: 'assigned' | 'in_progress' | 'completed';
    score?: number;
    maxScore?: number;

    // Detailed Results
    questionResponses: {
        questionId: string;
        questionText: string;
        selectedOption: string;
        correctOption?: string;
        isCorrect?: boolean;
        timeTaken?: number;
    }[];

    // Added field for template questions
    questions?: {
        text: string;
        options: string[];
        correctAnswer: number;
    }[];

    // AI Analysis of Result
    aiAnalysis?: {
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        careerFit: string[];
    };

    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        counsellorId: { type: Schema.Types.ObjectId, ref: 'User' },

        title: { type: String, required: true },
        type: {
            type: String,
            enum: ['Aptitude', 'Technical', 'Personality', 'Career'],
            required: true
        },
        category: String,

        status: {
            type: String,
            enum: ['assigned', 'in_progress', 'completed'],
            default: 'assigned'
        },

        score: Number,
        maxScore: Number,

        questionResponses: [{
            questionId: String,
            questionText: String,
            selectedOption: String,
            correctOption: String,
            isCorrect: Boolean,
            timeTaken: Number
        }],

        questions: [{
            text: String,
            options: [String],
            correctAnswer: Number
        }],

        aiAnalysis: {
            strengths: [String],
            weaknesses: [String],
            recommendations: [String],
            careerFit: [String]
        },

        completedAt: Date
    },
    { timestamps: true }
);

export const Assessment = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', assessmentSchema);
export default Assessment;
