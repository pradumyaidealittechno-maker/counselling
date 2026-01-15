import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industry: string;
  size: string;
  linkedInUrl?: string;
  locations: string[];
  logo?: string;
  settings: {
    culturalDNAEnabled: boolean;
    defaultInterviewDuration: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: true,
    },
    linkedInUrl: String,
    locations: [String],
    logo: String,
    settings: {
      culturalDNAEnabled: {
        type: Boolean,
        default: true,
      },
      defaultInterviewDuration: {
        type: Number,
        default: 30,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);
export default Company;
