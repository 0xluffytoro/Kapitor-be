import { Schema, model, Document } from 'mongoose';

/* =============================
   Types
============================= */

export interface ITransaction extends Document {
  userId: Schema.Types.ObjectId;
  txHash: string;
  toAddress: string;
  inrAmount: number;
  usdcAmount: number;
  source: 'payment-success';
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
      required: true,
      min: 0,
    },
    usdcAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ['payment-success'],
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
