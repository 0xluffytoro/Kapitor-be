import { Schema, model, Document, Types } from 'mongoose';

/* =============================
   Types
============================= */

export interface IPhoneNumber extends Document {
  phoneNumber: string;
  userId?: Types.ObjectId;
}

/* =============================
   Schema
============================= */

const phoneNumbersSchema = new Schema<IPhoneNumber>(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'phoneNumbers',
  }
);

/* =============================
   Indexes (performance)
============================= */

phoneNumbersSchema.index({ phoneNumber: 1 }, { unique: true });

/* =============================
   Model
============================= */

export const PhoneNumbers = model<IPhoneNumber>(
  'PhoneNumbers',
  phoneNumbersSchema
);
