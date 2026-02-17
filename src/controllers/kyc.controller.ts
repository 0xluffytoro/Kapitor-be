import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Kyc } from '../models/Kyc.model';
import { sendError, sendSuccess } from '../utils/response';

/**
 * Submit KYC documents
 * POST /kyc
 * Headers: Authorization: Bearer <token>
 */
export async function submitKyc(
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

    const documents = req.body?.documents ?? null;

    await Kyc.create({
      userId: uid,
      documents,
    });

    sendSuccess(res, { message: 'KYC under process' }, 200);
  } catch (error) {
    next(error);
  }
}
