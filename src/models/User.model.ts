import { Schema, model, Document } from 'mongoose';

/* =============================
   Types
============================= */

export interface IUser extends Document {
  name: string;
  dob: string;
  nationality: string;
  phoneNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  walletAddress?: string;
  walletId?: string;
  externalServerKeyShares?: unknown;
  role: 'user' | 'admin';
  investmentExperienceLevel?: 'Beginner' | 'intermediate' | 'expert';
  riskAppetite?: 'Low' | 'Medium' | 'High';
  purpose?: 'Investments' | 'trading' | 'payments';
  usage?: number;
}

/* =============================
   Schema
============================= */

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,

      trim: true,
      minlength: 2,
    },

    dob: {
      type: String,
    },

    nationality: {
      type: String,
    },

    phoneNumber: {
      type: String,
    },

    address: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    zipCode: {
      type: String,
    },

    country: {
      type: String,
    },

    walletAddress: {
      type: String,
      default: undefined,
    },
    walletId: {
      type: String,
      trim: true,
    },
    externalServerKeyShares: {
      type: Schema.Types.Mixed,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    investmentExperienceLevel: {
      type: String,
      enum: ['Beginner', 'intermediate', 'expert'],
      required: false,
    },
    riskAppetite: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: false,
    },
    purpose: {
      type: String,
      enum: ['Investments', 'trading', 'payments'],
      required: false,
    },
    usage: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false,
  }
);

// Only enforce uniqueness when walletAddress is a non-null string
userSchema.index(
  { walletAddress: 1 },
  {
    unique: true,
    partialFilterExpression: { walletAddress: { $type: 'string' } },
  }
);

/* =============================
   Model
============================= */

export const User = model<IUser>('User', userSchema);
