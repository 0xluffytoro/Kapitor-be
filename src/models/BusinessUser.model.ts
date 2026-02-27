import { Document, model, Schema } from 'mongoose';

export interface IBusinessUser extends Document {
  businessName: string;
  businessEntitiyType: string;
  companyRegistration: string;
  dateOfIncorporation: string;
  ownerName: string;
  ownerShipPercentage: number;
  walletAddress: string;
  phoneNumber: string;
  certificateOfIncorporation?: string;
  addressProof?: string;
  kybStatus?: 'pending' | 'verified' | 'rejected' | 'in_review';
  investmentExperienceLevel?: 'Beginner' | 'intermediate' | 'expert';
  riskAppetite?: 'Low' | 'Medium' | 'High';
  purpose?: 'Investments' | 'trading' | 'payments';
  usage?: number;
}

const businessUserSchema = new Schema<IBusinessUser>(
  {
    businessName: {
      type: String,
      required: true,
    },
    businessEntitiyType: {
      type: String,
      required: true,
    },
    companyRegistration: {
      type: String,
      required: true,
      index: true,
    },
    dateOfIncorporation: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    ownerShipPercentage: {
      type: Number,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    certificateOfIncorporation: {
      type: String,
    },
    addressProof: {
      type: String,
    },
    kybStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'in_review'],
      default: 'pending',
      required: false,
    },
    investmentExperienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      required: false,
    },
    riskAppetite: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: false,
    },
    purpose: {
      type: String,
      enum: ['investments', 'trading', 'payments'],
      required: false,
    },
    usage: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const BusinessUser = model<IBusinessUser>(
  'BusinessUser',
  businessUserSchema
);
