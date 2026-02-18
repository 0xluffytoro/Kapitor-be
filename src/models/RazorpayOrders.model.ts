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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =============================
   Indexes (performance)
============================= */

razorpayOrderSchema.index({ order_id: 1 });
razorpayOrderSchema.index({ payment_id: 1 });

/* =============================
   Model
============================= */

export const RazorpayOrders = model<IRazorpayOrder>(
  'RazorpayOrders',
  razorpayOrderSchema
);
