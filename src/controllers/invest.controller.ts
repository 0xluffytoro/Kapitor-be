import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User.model';
import { Pools } from '../models/Pools.model';
import { Transaction } from '../models/Transaction.model';
import { sendError, sendSuccess } from '../utils/response';
import { transferFromUserWallet } from '../services/user-wallet.service';

export async function invest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const uid = req.uid as string;
    const { poolAddress, amount } = req.body;

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

    const user = await User.findById(uid)
      .select('walletAddress externalServerKeyShares')
      .lean();
    if (!user?.walletAddress || !user.externalServerKeyShares) {
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

    const result = await transferFromUserWallet({
      accountAddress: user.walletAddress,
      recipientAddress: pool.walletAddress,
      amount: parsedAmount,
      externalServerKeyShares: user.externalServerKeyShares,
      isUSDT: true,
    });

    const tx = await Transaction.create({
      userId: uid,
      txHash: result.txHash,
      toAddress: pool.walletAddress,
      tokenAmount: parsedAmount,
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
