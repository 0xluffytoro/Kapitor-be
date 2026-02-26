import { Response, NextFunction } from 'express';
import { Pools } from '../models/Pools.model';
import { sendSuccess } from '../utils/response';

/**
 * Create pool
 * POST /pools
 */
export async function createPool(
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      poolId,
      name,
      capacity,
      startDate,
      endDate,
      roiOneYear,
      roiThreeYears,
      roiFiveYears,
      min_investment,
      image,
    } = req.body;

    const parsedCapacity = Number(capacity);
    const parsedMinInvestment = Number(min_investment);
    const { DynamicEvmWalletClient } =
      await import('@dynamic-labs-wallet/node-evm/index.esm.js');
    const client = new DynamicEvmWalletClient({
      environmentId: process.env.DYNAMIC_ENVIRONMENT_ID ?? '',
      enableMPCAccelerator: false,
    });

    await client.authenticateApiToken(process.env.DYNAMIC_API_TOKEN ?? '');

    const { ThresholdSignatureScheme } =
      await import('@dynamic-labs-wallet/node/index.esm.js');

    const evmWallet = await client.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: process.env.WALLET_PASSWORD,
      backUpToClientShareService: true,
    });

    const pool = await Pools.create({
      walletAddress: evmWallet.accountAddress,
      poolId,
      name,
      capacity: parsedCapacity,
      currenlyFilled: 0,
      startDate,
      endDate,
      roiOneYear,
      roiThreeYears,
      roiFiveYears,
      min_investment: parsedMinInvestment,
      image,
    });

    sendSuccess(
      res,
      {
        id: pool._id,
        poolId: pool.poolId,
        name: pool.name,
        walletAddress: pool.walletAddress,
        capacity: pool.capacity,
        currenlyFilled: pool.currenlyFilled,
        startDate: pool.startDate,
        endDate: pool.endDate,
        roiOneYear: pool.roiOneYear,
        roiThreeYears: pool.roiThreeYears,
        roiFiveYears: pool.roiFiveYears,
        min_investment: pool.min_investment,
        image: pool.image,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}
