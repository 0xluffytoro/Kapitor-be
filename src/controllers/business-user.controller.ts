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

    const businessUser = await BusinessUser.create({
      businessName,
      businessEntitiyType,
      companyRegistration,
      dateOfIncorporation,
      ownerName,
      ownerShipPercentage,
      walletAddress: evmWallet.accountAddress,
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
      },
      201
    );
  } catch (error) {
    next(error);
  }
}
