import { Request, Response, NextFunction } from 'express';
import { BusinessUser } from '../models/BusinessUser.model';
import { sendSuccess } from '../utils/response';

/**
 * Create business user account
 * POST /business-user
 */
export async function createBusinessUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      businessName,
      businessEntitiyType,
      companyRegistration,
      dateOfIncorporation,
      ownerName,
      ownerShipPercentage,
    } = req.body;

    const businessUser = await BusinessUser.create({
      businessName,
      businessEntitiyType,
      companyRegistration,
      dateOfIncorporation,
      ownerName,
      ownerShipPercentage,
    });

    sendSuccess(
      res,
      {
        id: businessUser._id,
        businessName: businessUser.businessName,
        businessEntitiyType: businessUser.businessEntitiyType,
        companyRegistration: businessUser.companyRegistration,
        dateOfIncorporation: businessUser.dateOfIncorporation,
        ownerName: businessUser.ownerName,
        ownerShipPercentage: businessUser.ownerShipPercentage,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}
