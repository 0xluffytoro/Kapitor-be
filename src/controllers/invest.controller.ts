import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.js';
import { Pools } from '../models/Pools.model.js';
import { Transaction } from '../models/Transaction.model.js';
import { sendError, sendSuccess } from '../utils/response.js';
import {
  readTokenBalance,
  transferFromUserWallet,
} from '../services/user-wallet.service.js';
import { findAccountById } from '../services/account.service.js';

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

    const remainingCapacity = pool.capacity - (pool.currenlyFilled ?? 0);
    if (remainingCapacity < parsedAmount) {
      sendError(res, 'Pool does not have enough capacity', 400);
      return;
    }

    const usdtBalance = await readTokenBalance(
      'USDT',
      user.walletAddress,
      process.env.USDT_ADDRESS,
      6
    );
    if (usdtBalance.error) {
      sendError(res, usdtBalance.error, 500);
      return;
    }

    const availableUsdt = Number(usdtBalance.balance);
    if (!Number.isFinite(availableUsdt)) {
      sendError(res, 'Unable to determine user USDT balance', 500);
      return;
    }
    if (availableUsdt < parsedAmount) {
      sendError(res, 'Insufficient USDT balance', 400);
      return;
    }

    const result = await transferFromUserWallet({
      accountAddress: user.walletAddress,
      recipientAddress: pool.walletAddress,
      amount: parsedAmount,
      isUSDT: true,
    });

    if (!result.txHash?.trim()) {
      sendError(res, 'Transfer failed: transaction hash not received', 502, {
        result,
      });
      return;
    }

    const tx = await Transaction.create({
      userId: uid,
      txHash: result.txHash,
      toAddress: pool.walletAddress,
      tokenAmount: parsedAmount,
      lockInPeriod,
      source: 'investment',
    });

    pool.currenlyFilled = (pool.currenlyFilled ?? 0) + parsedAmount;
    await pool.save();

    sendSuccess(
      res,
      {
        message: 'Investment successful',
        transaction: tx,
        result,
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
