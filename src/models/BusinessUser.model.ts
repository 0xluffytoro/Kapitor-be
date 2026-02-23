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
