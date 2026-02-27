import { Response, NextFunction } from 'express';
import { BusinessUser } from '../models/BusinessUser.model';
import { sendSuccess, sendError } from '../utils/response';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User.model';
import { toE164 } from '../services/otp.service';

/**
 * Create business user account
 * POST /business-user
 */
export async function createBusinessUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid;
    if (!uid) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const {
      businessName,
      businessEntitiyType,
      companyRegistration,
      dateOfIncorporation,
      ownerName,
      ownerShipPercentage,
      phoneNumber,
    } = req.body;

    if (!phoneNumber) {
      sendError(res, 'phoneNumber is required', 400);
      return;
    }

    const existingUser = await User.findById(uid).select('_id');
    if (existingUser) {
      await User.findByIdAndDelete(uid);
    }

    const { DynamicEvmWalletClient } =
      await import('@dynamic-labs-wallet/node-evm');
    const client = new DynamicEvmWalletClient({
      environmentId: process.env.DYNAMIC_ENVIRONMENT_ID ?? '',
      enableMPCAccelerator: false,
    });

    await client.authenticateApiToken(process.env.DYNAMIC_API_TOKEN ?? '');

    const { ThresholdSignatureScheme } =
      await import('@dynamic-labs-wallet/node');

    const evmWallet = await client.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: process.env.WALLET_PASSWORD,
      backUpToClientShareService: true,
    });

    const files = req.files as
      | {
          [fieldname: string]: Express.Multer.File[];
        }
      | undefined;

    const certificateFile = files?.certificateOfIncorporation?.[0];
    const addressFile = files?.addressProof?.[0];

    if (!certificateFile || !addressFile) {
      sendError(
        res,
        'Both certificateOfIncorporation and addressProof files are required',
        400
      );
      return;
    }

    const businessUser = await BusinessUser.create({
      _id: uid,
      businessName,
      businessEntitiyType,
      companyRegistration,
      dateOfIncorporation,
      ownerName,
      ownerShipPercentage,
      walletAddress: evmWallet.accountAddress,
      phoneNumber: toE164(phoneNumber),
      certificateOfIncorporation: `${process.env.END_POINT}/document/${certificateFile.filename}`,
      addressProof: `${process.env.END_POINT}/document/${addressFile.filename}`,
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
        walletAddress: evmWallet.accountAddress,
        phoneNumber: businessUser.phoneNumber,
        certificateOfIncorporation: businessUser.certificateOfIncorporation,
        addressProof: businessUser.addressProof,
        kyb: businessUser.kybStatus,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get business user account
 * GET /business-user/:id
 */
export async function getBusinessUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid business user ID', 400);
      return;
    }

    const businessUser = await BusinessUser.findById(id).lean();

    if (!businessUser) {
      sendError(res, 'Business user not found', 404);
      return;
    }

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
        walletAddress: businessUser.walletAddress,
        phoneNumber: businessUser.phoneNumber,
        certificateOfIncorporation: businessUser.certificateOfIncorporation,
        addressProof: businessUser.addressProof,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Update business user risk profile
 * POST /business-user/risk-profile
 */
export async function updateBusinessUserRiskProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uid = req.uid;
    if (!uid) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { investmentExperienceLevel, riskAppetite, purpose, usage } =
      req.body as {
        investmentExperienceLevel?: string;
        riskAppetite?: string;
        purpose?: string;
        usage?: number;
      };

    const businessUser = await BusinessUser.findByIdAndUpdate(
      uid,
      {
        investmentExperienceLevel,
        riskAppetite,
        purpose,
        usage,
      },
      { new: true }
    );

    if (!businessUser) {
      sendError(res, 'Business user not found', 404);
      return;
    }

    sendSuccess(
      res,
      {
        id: businessUser._id,
        investmentExperienceLevel: businessUser.investmentExperienceLevel,
        riskAppetite: businessUser.riskAppetite,
        purpose: businessUser.purpose,
        usage: businessUser.usage,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}
