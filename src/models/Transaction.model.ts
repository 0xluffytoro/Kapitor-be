import { Schema, model, Document } from 'mongoose';

/* =============================
   Types
============================= */

export interface ITransaction extends Document {
  userId: Schema.Types.ObjectId;
  txHash: string;
  toAddress: string;
  inrAmount?: number;
  usdcAmount?: number;
  tokenAmount?: number;
  lockInPeriod?: '1y' | '3y' | '5y';
  source: 'payment-success' | 'user-transaction' | 'investment';
}

/* =============================
   Schema
============================= */

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    toAddress: {
      type: String,
      required: true,
      trim: true,
    },
    inrAmount: {
      type: Number,
      min: 0,
    },
    usdcAmount: {
      type: Number,
      min: 0,
    },
    tokenAmount: {
      type: Number,
      min: 0,
    },
    lockInPeriod: {
      type: String,
      enum: ['1y', '3y', '5y'],
      trim: true,
    },
    source: {
      type: String,
      enum: ['payment-success', 'user-transaction', 'investment'],
      required: true,
      default: 'payment-success',
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

export const Transaction = model<ITransaction>(
  'Transaction',
  transactionSchema
);
