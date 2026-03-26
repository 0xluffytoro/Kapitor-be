import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { Pools } from '../models/Pools.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { sendError, sendSuccess } from '../utils/response.js';
import { findAccountById } from '../services/account.service.js';
import {
  canFulfillPayment,
  getInrAmountInUsdc,
  mintTo,
} from '../services/payment.service.js';

function buildPoolDetailsSnapshot(pool: {
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
}) {
  return {
    poolId: pool.poolId,
    name: pool.name,
    walletAddress: pool.walletAddress,
    capacity: pool.capacity,
    currenlyFilled: pool.currenlyFilled,
    startDate: pool.startDate,
    endDate: pool.endDate,
    roiOneYear: pool.roiOneYear,
    roiThreeYears: pool.roiThreeYears,
    roiFiveYears: pool.roiFiveYears,
    min_investment: pool.min_investment,
    image: pool.image,
  };
}

export async function invest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const uid = req.uid as string;
    const { poolAddress, amount, lockInPeriod } = req.body;
    const allowedLockInPeriods = ['1y', '3y', '5y'] as const;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }
    if (!poolAddress) {
      sendError(res, 'poolAddress is required', 400);
      return;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      sendError(res, 'amount must be a positive number', 400);
      return;
    }
    if (parsedAmount < 1000) {
      sendError(res, 'amount must be at least 1000', 400);
      return;
    }
    if (
      typeof lockInPeriod !== 'string' ||
      !allowedLockInPeriods.includes(
        lockInPeriod as (typeof allowedLockInPeriods)[number]
      )
    ) {
      sendError(res, 'lockInPeriod must be one of 1y, 3y, or 5y', 400);
      return;
    }

    const user = await findAccountById(uid);
    if (!user?.walletAddress) {
      sendError(res, 'User wallet is not configured', 400);
      return;
    }

    const pool = await Pools.findOne({ walletAddress: poolAddress });
    if (!pool) {
      sendError(res, 'Pool not found', 404);
      return;
    }

    const existingInvestment = await Transaction.exists({
      userId: uid,
      source: 'investment',
      'poolDetails.walletAddress': pool.walletAddress,
    });
    if (existingInvestment) {
      sendError(res, 'User has already invested in this pool', 403);
      return;
    }

    const remainingCapacity = pool.capacity - (pool.currenlyFilled ?? 0);
    if (remainingCapacity < parsedAmount) {
      sendError(res, 'Pool does not have enough capacity', 400);
      return;
    }

    const kptAmount = await getInrAmountInUsdc(parsedAmount);
    const treasuryReadiness = await canFulfillPayment(parsedAmount);
    if (!treasuryReadiness.ok) {
      sendError(
        res,
        treasuryReadiness.message ??
          'Treasury cannot transfer KPT to this pool right now',
        400
      );
      return;
    }

    const kptTransferResult = await mintTo(
      pool.walletAddress,
      kptAmount.toString()
    );

    if (!kptTransferResult.txHash?.trim()) {
      sendError(
        res,
        'Treasury KPT transfer failed: transaction hash not received',
        502,
        {
          result: kptTransferResult,
        }
      );
      return;
    }

    const updatedPoolFilled = (pool.currenlyFilled ?? 0) + parsedAmount;
    const tx = await Transaction.create({
      userId: uid,
      txHash: kptTransferResult.txHash,
      toAddress: pool.walletAddress,
      tokenAmount: parsedAmount,
      usdcAmount: parsedAmount,
      lockInPeriod,
      source: 'investment',
      poolDetails: buildPoolDetailsSnapshot({
        poolId: pool.poolId,
        name: pool.name,
        walletAddress: pool.walletAddress,
        capacity: pool.capacity,
        currenlyFilled: updatedPoolFilled,
        startDate: pool.startDate,
        endDate: pool.endDate,
        roiOneYear: pool.roiOneYear,
        roiThreeYears: pool.roiThreeYears,
        roiFiveYears: pool.roiFiveYears,
        min_investment: pool.min_investment,
        image: pool.image,
      }),
    });

    pool.currenlyFilled = updatedPoolFilled;
    await pool.save();

    sendSuccess(
      res,
      {
        message: 'Investment successful',
        transaction: tx,
        result: kptTransferResult,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getInvestments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const uid = req.uid as string;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const transactions = await Transaction.find({
      userId: uid,
      source: 'investment',
    })
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { transactions }, 200);
  } catch (error) {
    next(error);
  }
}

export async function totalInvestment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const uid = req.uid as string;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(uid),
          source: 'investment',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$tokenAmount' },
        },
      },
    ]);

    const total = result[0]?.total ?? 0;
    sendSuccess(res, { total }, 200);
  } catch (error) {
    next(error);
  }
}
