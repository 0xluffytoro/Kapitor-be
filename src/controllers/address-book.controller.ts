import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ethers } from 'ethers';
import { AuthRequest } from '../middleware/auth.js';
import { AddressBook } from '../models/AddressBook.model.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getAddressBook(
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

    const addresses = await AddressBook.find({ userId: uid })
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { addresses }, 200);
  } catch (error) {
    next(error);
  }
}

export async function addAddressBookEntry(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid as string;
    const { walletAddress, name } = req.body as {
      walletAddress?: string;
      name?: string;
    };

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }
    if (!walletAddress || !name) {
      sendError(res, 'walletAddress and name are required', 400);
      return;
    }
    if (!ethers.isAddress(walletAddress)) {
      sendError(res, 'Invalid walletAddress', 400);
      return;
    }

    const normalizedWalletAddress = ethers.getAddress(walletAddress);

    const entry = await AddressBook.create({
      userId: uid,
      walletAddress: normalizedWalletAddress,
      name: name.trim(),
    });

    sendSuccess(
      res,
      {
        id: entry._id,
        userId: entry.userId,
        walletAddress: entry.walletAddress,
        name: entry.name,
      },
      201
    );
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      sendError(res, 'Address already exists in address book', 409);
      return;
    }
    next(error);
  }
}
