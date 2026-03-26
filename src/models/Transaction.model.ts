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
  poolDetails?: {
    poolId: string;
    name: string;
    walletAddress: string;
    capacity: number;
    currenlyFilled: number;
    startDate: string;
    endDate: string;
    roiOneYear: number;
    roiThreeYears: number;
    roiFiveYears: number;
    min_investment: number;
    image?: string;
  };
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
    poolDetails: {
      poolId: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      walletAddress: {
        type: String,
        trim: true,
      },
      capacity: {
        type: Number,
        min: 0,
      },
      currenlyFilled: {
        type: Number,
        min: 0,
      },
      startDate: {
        type: String,
        trim: true,
      },
      endDate: {
        type: String,
        trim: true,
      },
      roiOneYear: {
        type: Number,
        min: 0,
      },
      roiThreeYears: {
        type: Number,
        min: 0,
      },
      roiFiveYears: {
        type: Number,
        min: 0,
      },
      min_investment: {
        type: Number,
        min: 0,
      },
      image: {
        type: String,
        trim: true,
      },
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
