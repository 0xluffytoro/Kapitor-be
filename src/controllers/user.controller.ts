import { Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { PhoneNumbers } from '../models/PhoneNumbers.model';

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

    const evmWallet = await client.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: process.env.WALLET_PASSWORD,
      backUpToClientShareService: false,
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
