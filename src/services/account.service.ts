import type { ServerKeyShare } from '@dynamic-labs-wallet/node';
import { BusinessUser } from '../models/BusinessUser.model.js';
import { User } from '../models/User.model.js';

type AccountLike = {
  _id: unknown;
  walletAddress?: string;
  phoneNumber?: string;
  externalServerKeyShares?: ServerKeyShare[];
};

export async function findAccountById(
  uid: string
): Promise<AccountLike | null> {
  const user = await User.findById(uid)
    .select('_id walletAddress phoneNumber externalServerKeyShares')
    .lean<AccountLike | null>();

  if (user) {
    return user;
  }

  return BusinessUser.findById(uid)
    .select('_id walletAddress phoneNumber externalServerKeyShares')
    .lean<AccountLike | null>();
}
