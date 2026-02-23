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

    const { adhaarCard, drivingLicense, panCard } = req.body;

    if (!adhaarCard && !drivingLicense && !panCard) {
      sendError(res, 'At least one document is required', 400);
      return;
    }

    await Kyc.create({
      userId: uid,
      adhaarCard: adhaarCard ?? null,
      drivingLicense: drivingLicense ?? null,
      panCard: panCard ?? null,
      status: 'in_review',
    });

    sendSuccess(
      res,
      { message: 'Document submitted successfully, KYC under process' },
      200
    );
  } catch (error) {
    next(error);
  }
}
