import { model, Schema } from 'mongoose';

export interface IPool extends Document {
  walletAddress: string;
  poolId: string;
  name: string;
  capacity: number;
  currenlyFilled: number;
  startDate: string;
  endDate: string;
  roiOneYear: number;
  roiThreeYears: number;
  roiFiveYears: number;
  min_investment: number;
  image: string;
}

const poolsSchema = new Schema<IPool>({
  walletAddress: { type: String, required: true },
  poolId: { type: String, required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  currenlyFilled: { type: Number, default: 0 },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  roiOneYear: { type: Number, required: true },
  roiThreeYears: { type: Number, required: true },
  roiFiveYears: { type: Number, required: true },
  min_investment: { type: Number, required: true },
  image: { type: String, required: false },
});

export const Pools = model<IPool>('Pools', poolsSchema);
