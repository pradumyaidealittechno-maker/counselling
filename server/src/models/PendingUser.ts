import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingUser extends Document {
    email: string;
    passwordHash: string;
    userData: {
        firstName: string;
        lastName: string;
        company: string;
        jobTitle: string;
    };
    otp: string;
    otpExpires: Date;
    createdAt: Date;
}

const pendingUserSchema = new Schema<IPendingUser>(
    {
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        userData: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            company: { type: String, required: true },
            jobTitle: { type: String, required: true }
        },
        otp: { type: String, required: true },
        otpExpires: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins
    },
    { timestamps: true }
);

export const PendingUser = mongoose.models.PendingUser || mongoose.model<IPendingUser>('PendingUser', pendingUserSchema);
