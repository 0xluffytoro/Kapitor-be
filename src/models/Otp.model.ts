import { Schema, model, Document } from 'mongoose';

/* =============================
   Types
============================= */

export interface IOtp extends Document {
  phoneNumber: string;
  otp: string;
  otpExpiration: Date;
}

/* =============================
   Schema
============================= */

const otpSchema = new Schema<IOtp>(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiration: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'otps',
  }
);

/* =============================
   Indexes (performance)
============================= */

// TTL index to auto-remove expired OTPs (optional cleanup)
otpSchema.index({ otpExpiration: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phoneNumber: 1 });

/* =============================
   Model
============================= */

export const Otp = model<IOtp>('Otp', otpSchema);
