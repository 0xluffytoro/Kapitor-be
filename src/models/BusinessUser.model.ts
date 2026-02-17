import { Document, model, Schema } from 'mongoose';

export interface IBusinessUser extends Document {
  businessName: string;
  businessEntitiyType: string;
  companyRegistration: string;
  dateOfIncorporation: string;
  ownerName: string;
  ownerShipPercentage: number;
  walletAddress: string;
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

businessUserSchema.index({ companyRegistration: 1 });

export const BusinessUser = model<IBusinessUser>(
  'BusinessUser',
  businessUserSchema
);
