import { Document, model, Schema, Types } from 'mongoose';

/* =============================
   Types
============================= */

export interface IKyc extends Document {
  userId: Types.ObjectId;
  documents: Record<string, unknown> | unknown[] | null;
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
    documents: {
      type: Schema.Types.Mixed,
      default: null,
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
