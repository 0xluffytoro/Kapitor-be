import { Schema, model, Document } from 'mongoose';

export interface IAddressBook extends Document {
  userId: Schema.Types.ObjectId;
  walletAddress: string;
  name: string;
}

const addressBookSchema = new Schema<IAddressBook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

addressBookSchema.index({ userId: 1, walletAddress: 1 }, { unique: true });

export const AddressBook = model<IAddressBook>(
  'AddressBook',
  addressBookSchema
);
