import { Document, model, Schema, Types } from 'mongoose';

/* =============================
   Types
============================= */

export interface IKyc extends Document {
  userId: Types.ObjectId;
  adhaarCard: string;
  drivingLicense: string;
  panCard: string;
  status: 'pending' | 'verified' | 'rejected';
}

/* =============================
   Schema
============================= */

const kycSchema = new Schema<IKyc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adhaarCard: {
      type: String,
      required: false,
    },
    drivingLicense: {
      type: String,
      required: false,
    },
    panCard: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =============================
   Model
============================= */

export const Kyc = model<IKyc>('Kyc', kycSchema);
