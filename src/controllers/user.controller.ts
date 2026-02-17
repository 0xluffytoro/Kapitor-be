import { Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { PhoneNumbers } from '../models/PhoneNumbers.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

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

    const phoneRecord = await PhoneNumbers.findOne({ userId: user._id })
      .select('phoneNumber')
      .lean();

    // Return user with address stored in separate fields (address, city, state, zipCode, country)
    sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        dob: user.dob,
        nationality: user.nationality,
        phoneNumber: phoneRecord?.phoneNumber ?? user.phoneNumber,
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
