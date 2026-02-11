import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
    firstName: string;
    lastName: string;
    email: string; // Unique
    password?: string; // Optional initially, for student portal access
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;

    // Academic Info
    currentGrade: string;
    currentSchool: string;
    currentBoard: string; // CBSE, ICSE, etc.
    academicYear: string;

    // Documents
    documents: {
        type: 'transcript' | 'test_score' | 'certificate' | 'essay' | 'other';
        fileName: string;
        fileUrl: string;
        uploadedAt: Date;
        academicYear?: string;
        subject?: string;
    }[];

    // AI Profile
    studentProfile: {
        strengths: string[];
        weaknesses: string[];
        interests: string[];
        aptitudeScores: {
            analytical: number;
            creative: number;
            technical: number;
            verbal: number;
            numerical: number;
        };
        personalityTraits: string[];
        learningStyle: string;
    };

    // Career Guidance
    careerInterests: string[];
    suggestedCareerPaths: {
        career: string;
        matchScore: number;
        reasoning: string;
        requiredEducation: string[];
        suggestedCourses: string[];
    }[];

    // Academic Planning
    currentSubjects: string[];
    suggestedSubjects: string[];
    studyPlan: {
        shortTerm: string[];
        mediumTerm: string[];
        longTerm: string[];
    };

    // Status
    status: 'active' | 'inactive' | 'graduated' | 'transferred';
    enrollmentDate: Date;
    lastSessionDate?: Date;
    nextSessionDate?: Date;

    // Relationships
    counsellorId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;

    // Metadata
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidatePassword: string): Promise<boolean>;
}

const studentSchema = new Schema<IStudent>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String },
        phone: { type: String },
        dateOfBirth: { type: Date },
        gender: { type: String },

        currentGrade: { type: String, required: true },
        currentSchool: { type: String },
        currentBoard: { type: String },
        academicYear: { type: String },

        documents: [{
            type: { type: String, enum: ['transcript', 'test_score', 'certificate', 'essay', 'other'] },
            fileName: String,
            fileUrl: String,
            uploadedAt: { type: Date, default: Date.now },
            academicYear: String,
            subject: String
        }],

        studentProfile: {
            strengths: [String],
            weaknesses: [String],
            interests: [String],
            aptitudeScores: {
                analytical: Number,
                creative: Number,
                technical: Number,
                verbal: Number,
                numerical: Number
            },
            personalityTraits: [String],
            learningStyle: String
        },

        careerInterests: [String],
        suggestedCareerPaths: [{
            career: String,
            matchScore: Number,
            reasoning: String,
            requiredEducation: [String],
            suggestedCourses: [String]
        }],

        currentSubjects: [String],
        suggestedSubjects: [String],
        studyPlan: {
            shortTerm: [String],
            mediumTerm: [String],
            longTerm: [String]
        },

        status: {
            type: String,
            enum: ['active', 'inactive', 'graduated', 'transferred'],
            default: 'active'
        },
        enrollmentDate: { type: Date, default: Date.now },
        lastSessionDate: Date,
        nextSessionDate: Date,

        counsellorId: { type: Schema.Types.ObjectId, ref: 'User' },
        parentId: { type: Schema.Types.ObjectId, ref: 'Parent' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

// Hash password before saving
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

studentSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
export default Student;
