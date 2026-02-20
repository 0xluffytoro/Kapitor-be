import { Schema, model, Document } from 'mongoose';

/* =============================
   Types
============================= */

export interface IPendingTransaction extends Document {
  userId: Schema.Types.ObjectId;
  amount: number;
  recipientAddress: string;
  otp: string;
  otpExpiration: Date;
  status: 'pending' | 'verified' | 'failed';
  txHash?: string;
}

/* =============================
   Schema
============================= */

const pendingTransactionSchema = new Schema<IPendingTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    recipientAddress: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiration: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      required: true,
      default: 'pending',
    },
    txHash: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =============================
   Indexes (performance)
============================= */

pendingTransactionSchema.index({ otpExpiration: 1 }, { expireAfterSeconds: 0 });

/* =============================
   Model
============================= */

export const PendingTransaction = model<IPendingTransaction>(
  'PendingTransaction',
  pendingTransactionSchema
);
