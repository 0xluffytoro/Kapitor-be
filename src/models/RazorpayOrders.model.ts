import { Schema, model, Document } from 'mongoose';

/* =============================
   Types
============================= */

export interface IRazorpayOrder extends Document {
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  payment_id?: string;
  userId: Schema.Types.ObjectId;
}

/* =============================
   Schema
============================= */

const razorpayOrderSchema = new Schema<IRazorpayOrder>(
  {
    order_id: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    receipt: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    payment_id: {
      type: String,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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

/* =============================
   Model
============================= */

export const RazorpayOrders = model<IRazorpayOrder>(
  'RazorpayOrders',
  razorpayOrderSchema
);
