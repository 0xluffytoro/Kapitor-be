import { Response, NextFunction } from 'express';
import twilio from 'twilio';
import { User } from '../models/User.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { PhoneNumbers } from '../models/PhoneNumbers.model';
import { Transaction } from '../models/Transaction.model';
import { PendingTransaction } from '../models/PendingTransaction.model';
import {
  generateOTP,
  toE164,
  OTP_EXPIRATION_SECONDS,
} from '../services/otp.service';
import { transferFromUserWallet } from '../services/user-wallet.service';
import { ethers } from 'ethers';
import ERC20_ABI from '../utils/ERC20ABI';

/**
 * Get authenticated user's details
 * GET /user/details
 * Headers: Authorization: Bearer <token>
 */
export async function getDetails(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const user = await User.findById(uid).select('-__v').lean();

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Return user with address stored in separate fields (address, city, state, zipCode, country)
    sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        dob: user.dob,
        nationality: user.nationality,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
        walletAddress: user.walletAddress,
        role: user.role,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Create user profile
 * POST /user
 * Headers: Authorization: Bearer <token>
 */
export async function createUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;
    const {
      name,
      dob,
      nationality,
      address,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const existingUser = await User.findOne({ phoneNumber })
      .select('-__v')
      .lean();
    if (existingUser) {
      sendError(res, 'User already exists', 409);
      return;
    }

    const { DynamicEvmWalletClient } =
      await import('@dynamic-labs-wallet/node-evm');
    const client = new DynamicEvmWalletClient({
      environmentId: process.env.DYNAMIC_ENVIRONMENT_ID ?? '',
      enableMPCAccelerator: false,
    });

    const { ThresholdSignatureScheme } =
      await import('@dynamic-labs-wallet/node');

    await client.authenticateApiToken(process.env.DYNAMIC_API_TOKEN ?? '');

    const evmWallet = await client.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: process.env.WALLET_PASSWORD,
      backUpToClientShareService: true,
    });

    const user = await User.create({
      _id: uid,
      name,
      dob,
      nationality,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
      walletAddress: evmWallet.accountAddress,
      walletId: evmWallet.walletId,
      externalServerKeyShares: evmWallet.externalServerKeyShares,
      role: 'user',
    });

    await PhoneNumbers.updateOne({ _id: uid }, { $set: { userId: user._id } });

    sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        dob: user.dob,
        nationality: user.nationality,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
        walletAddress: user.walletAddress,
        role: user.role,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get recent transactions for authenticated user
 * GET /user/recent-transactions
 * Headers: Authorization: Bearer <token>
 */
export async function getRecentTransactions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const transactions = await Transaction.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentAddresses = Array.from(
      new Set(transactions.map(t => t.toAddress))
    );

    sendSuccess(
      res,
      {
        recentAddresses,
        transactions,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Send transaction OTP and create pending transaction
 * POST /user/transaction/send-transaction
 */
export async function sendTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;
    const { amount, recipientAddress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      sendError(res, 'amount must be greater than zero', 400);
      return;
    }
    if (!recipientAddress) {
      sendError(res, 'recipientAddress is required', 400);
      return;
    }

    const user = await User.findById(uid).select('phoneNumber').lean();
    if (!user?.phoneNumber) {
      sendError(res, 'User phone number not found', 404);
      return;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      sendError(res, 'Twilio is not configured', 503);
      return;
    }

    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000);

    const pending = await PendingTransaction.create({
      userId: uid,
      amount: Number(amount),
      recipientAddress,
      otp,
      otpExpiration,
      status: 'pending',
    });

    try {
      const client = twilio(accountSid, authToken);
      const toNumber = toE164(user.phoneNumber);
      const message = `Your Kapitor transaction code is: ${otp}. Valid for ${OTP_EXPIRATION_SECONDS} seconds.`;

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber,
      });
    } catch (error) {
      await PendingTransaction.deleteOne({ _id: pending._id });
      if (error && typeof error === 'object' && 'code' in error) {
        const twilioError = error as {
          code?: number;
          status?: number;
          message?: string;
        };
        if (twilioError.code === 21608 || twilioError.code === 21211) {
          sendError(res, 'Invalid phone number', 400);
          return;
        }
        if (twilioError.status === 400) {
          sendError(res, twilioError.message || 'Bad request', 400);
          return;
        }
      }
      throw error;
    }

    sendSuccess(
      res,
      {
        pendingTransactionId: pending._id,
        expiresIn: OTP_EXPIRATION_SECONDS,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Verify transaction OTP and execute transfer
 * POST /user/transaction/verify-transaction
 */
export async function verifyTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;
    const { transactionId, otp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }
    if (!transactionId) {
      sendError(res, 'transactionId is required', 400);
      return;
    }
    if (!otp) {
      sendError(res, 'otp is required', 400);
      return;
    }

    const pending = await PendingTransaction.findOne({
      _id: transactionId,
      userId: uid,
      status: 'pending',
    });

    if (!pending) {
      sendError(res, 'Pending transaction not found', 404);
      return;
    }

    if (new Date() > pending.otpExpiration) {
      pending.status = 'failed';
      await pending.save();
      sendError(res, 'OTP has expired. Please try again.', 400);
      return;
    }

    if (pending.otp !== otp) {
      sendError(res, 'Invalid OTP', 400);
      return;
    }

    const user = await User.findById(uid)
      .select('walletAddress externalServerKeyShares')
      .lean();
    if (!user?.walletAddress || !user.externalServerKeyShares) {
      sendError(res, 'User wallet is not configured', 400);
      return;
    }

    const result = await transferFromUserWallet({
      accountAddress: user.walletAddress,
      recipientAddress: pending.recipientAddress,
      amount: pending.amount,
      externalServerKeyShares: user.externalServerKeyShares,
    });

    const tx = await Transaction.create({
      userId: uid,
      txHash: result.txHash,
      toAddress: pending.recipientAddress,
      tokenAmount: pending.amount,
      source: 'user-transaction',
    });

    pending.status = 'verified';
    pending.txHash = result.txHash;
    await pending.save();

    sendSuccess(
      res,
      {
        message: 'Transaction verified and sent',
        transaction: tx,
        result,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get authenticated user's wallet balance
 * GET /user/balance
 */
export async function getBalance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const user = await User.findById(uid).select('walletAddress').lean();
    if (!user?.walletAddress) {
      sendError(res, 'User wallet address not found', 404);
      return;
    }

    const rpcUrl = process.env.ETH_RPC_URL;
    if (!rpcUrl) {
      sendError(res, 'ETH_RPC_URL is not configured', 500);
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const nativeBalance = await provider.getBalance(user.walletAddress);

    let tokenBalance: string | null = null;
    const tokenAddress = process.env.KPT_TOKEN_ADDRESS;
    if (tokenAddress) {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const decimalsEnv = process.env.KPT_TOKEN_DECIMALS;
      const decimals = decimalsEnv ? Number(decimalsEnv) : 18;
      const raw = await contract.balanceOf(user.walletAddress);
      tokenBalance = ethers.formatUnits(raw, decimals);
    }

    sendSuccess(
      res,
      {
        walletAddress: user.walletAddress,
        nativeBalanceWei: nativeBalance.toString(),
        nativeBalance: ethers.formatEther(nativeBalance),
        tokenBalance,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get authenticated user's transactions
 * GET /user/transactions
 */
export async function getUserTransactions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const limitParam = Number(req.query.limit);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 50;

    const transactions = await Transaction.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    sendSuccess(res, { transactions }, 200);
  } catch (error) {
    next(error);
  }
}
