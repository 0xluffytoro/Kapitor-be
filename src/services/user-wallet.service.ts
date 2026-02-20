import ERC20_ABI from '../utils/ERC20ABI';

export async function transferFromUserWallet(params: {
  accountAddress: string;
  recipientAddress: string;
  amount: number | string;
  externalServerKeyShares: unknown;
}): Promise<{ txHash: string }> {
  const { accountAddress, recipientAddress, amount, externalServerKeyShares } =
    params;

  const rpcUrl = process.env.ETH_RPC_URL;
  const tokenAddress = process.env.KPT_TOKEN_ADDRESS;
  const decimalsEnv = process.env.KPT_TOKEN_DECIMALS;
  const password = process.env.WALLET_PASSWORD;
  const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID;

  if (!rpcUrl) {
    throw new Error('ETH_RPC_URL is not configured');
  }
  if (!tokenAddress) {
    throw new Error('KPT_TOKEN_ADDRESS is not configured');
  }
  if (!environmentId) {
    throw new Error('DYNAMIC_ENVIRONMENT_ID is not configured');
  }
  if (!password) {
    throw new Error('WALLET_PASSWORD is not configured');
  }

  const decimals = decimalsEnv ? Number(decimalsEnv) : 18;
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error('KPT_TOKEN_DECIMALS must be a non-negative integer');
  }

  const { DynamicEvmWalletClient } =
    await import('@dynamic-labs-wallet/node-evm');
  const { parseAbi, encodeFunctionData, parseUnits } = await import('viem');

  const client = new DynamicEvmWalletClient({
    environmentId,
    enableMPCAccelerator: false,
  });

  const walletClient = await client.getWalletClient({
    accountAddress,
    password,
    externalServerKeyShares: externalServerKeyShares as any,
    rpcUrl,
  });

  const abi = parseAbi(ERC20_ABI as string[]);
  const data = encodeFunctionData({
    abi,
    functionName: 'transfer',
    args: [recipientAddress, parseUnits(String(amount), decimals)],
  });

  const txHash = await walletClient.sendTransaction({
    account: accountAddress as `0x${string}`,
    to: tokenAddress as `0x${string}`,
    data,
    value: 0n,
  });

  return { txHash };
}
