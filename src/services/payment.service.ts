import { ethers } from 'ethers';
import ERC20_ABI from '../utils/ERC20ABI';

export async function getInrAmountInUsdc(inrAmount: number): Promise<number> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=inr'
  );
  const data: { 'usd-coin': { inr: number } } = (await response.json()) as {
    'usd-coin': { inr: number };
  };
  const price = data['usd-coin'].inr;
  return inrAmount / price;
}

export async function mintTo(address: string, amount: string) {
  if (!address) {
    throw new Error('Mint target address is required');
  }
  if (!Number(amount)) {
    throw new Error('Mint amount must be greater than zero');
  }

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const signer = new ethers.Wallet(
    process.env.KAPITOR_TREASURY_PK ?? '',
    provider
  );
  const contract = new ethers.Contract(
    process.env.KPT_TOKEN_ADDRESS ?? '',
    ERC20_ABI,
    signer
  );

  const decimalsEnv = process.env.KPT_TOKEN_DECIMALS;
  const decimals = decimalsEnv ? Number(decimalsEnv) : 18;
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error('KPT_TOKEN_DECIMALS must be a non-negative integer');
  }

  const tx = await contract.transfer(
    address,
    ethers.parseUnits(String(amount), decimals)
  );
  const receipt = await tx.wait();
  return {
    mock: false,
    txHash: receipt.hash,
    amount,
  };
}
