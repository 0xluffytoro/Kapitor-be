import { ethers } from 'ethers';
import ERC20_ABI from '../utils/ERC20ABI.js';

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

const ERC20_ERROR_ABI = [
  'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
  'error ERC20InvalidSender(address sender)',
  'error ERC20InvalidReceiver(address receiver)',
  'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
  'error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)',
  'error OwnableUnauthorizedAccount(address account)',
];

function formatMintError(
  error: unknown,
  context?: {
    method: 'mint' | 'transfer';
    signerAddress: string;
    tokenAddress?: string;
  }
): Error {
  if (!(error instanceof Error)) {
    return new Error('Unknown token distribution error');
  }

  const data =
    typeof error === 'object' && error !== null && 'data' in error
      ? (error as { data?: string }).data
      : undefined;

  if (!data) {
    return error;
  }

  try {
    const iface = new ethers.Interface(ERC20_ERROR_ABI);
    const decoded = iface.parseError(data);

    if (decoded?.name === 'ERC20InsufficientBalance') {
      const [sender, balance, needed] = decoded.args;
      return new Error(
        `Treasury wallet ${sender} has insufficient token balance. Available: ${balance.toString()}, required: ${needed.toString()}`
      );
    }

    if (decoded?.name === 'ERC20InvalidReceiver') {
      const [receiver] = decoded.args;
      return new Error(`Invalid token receiver address: ${receiver}`);
    }

    if (decoded?.name === 'ERC20InvalidSender') {
      const [sender] = decoded.args;
      return new Error(`Invalid token sender address: ${sender}`);
    }

    if (decoded?.name === 'ERC20InsufficientAllowance') {
      const [spender, allowance, needed] = decoded.args;
      return new Error(
        `Insufficient allowance for ${spender}. Allowance: ${allowance.toString()}, required: ${needed.toString()}`
      );
    }

    if (decoded?.name === 'AccessControlUnauthorizedAccount') {
      const [account, neededRole] = decoded.args;
      return new Error(
        `Wallet ${account} is not authorized for ${context?.method ?? 'this'} on token ${context?.tokenAddress ?? 'contract'}. Required role: ${neededRole.toString()}`
      );
    }

    if (decoded?.name === 'OwnableUnauthorizedAccount') {
      const [account] = decoded.args;
      return new Error(
        `Wallet ${account} is not authorized for ${context?.method ?? 'this'} on token ${context?.tokenAddress ?? 'contract'}`
      );
    }

    return error;
  } catch {
    if (
      context?.method === 'mint' &&
      error.message.includes('require(false)') &&
      error.message.includes('estimateGas')
    ) {
      return new Error(
        `Mint reverted for treasury wallet ${context.signerAddress} on token ${context.tokenAddress ?? 'contract'}. The wallet likely lacks mint permission or the token does not support public minting. Set KPT_PAYMENT_DISTRIBUTION_METHOD=transfer to send pre-minted treasury tokens, or grant mint authority to this wallet.`
      );
    }

    return error;
  }
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

  const method = (process.env.KPT_PAYMENT_DISTRIBUTION_METHOD ?? 'transfer')
    .trim()
    .toLowerCase();
  if (method !== 'mint' && method !== 'transfer') {
    throw new Error(
      'KPT_PAYMENT_DISTRIBUTION_METHOD must be either "mint" or "transfer"'
    );
  }
  const amountInUnits = ethers.parseUnits(String(amount), decimals);

  console.info('[payment.mintTo] Starting token distribution', {
    method,
    tokenAddress: process.env.KPT_TOKEN_ADDRESS,
    recipient: address,
    amount,
    amountInUnits: amountInUnits.toString(),
    decimals,
    treasuryAddress: signer.address,
  });

  try {
    if (method === 'transfer') {
      const treasuryBalance = (await contract.balanceOf(
        signer.address
      )) as bigint;

      console.info('[payment.mintTo] Treasury balance fetched', {
        treasuryAddress: signer.address,
        treasuryBalance: treasuryBalance.toString(),
        treasuryBalanceFormatted: ethers.formatUnits(treasuryBalance, decimals),
      });

      if (treasuryBalance < amountInUnits) {
        throw new Error(
          `Treasury wallet ${signer.address} has insufficient token balance. Available: ${treasuryBalance.toString()}, required: ${amountInUnits.toString()}`
        );
      }

      const tx = await contract.transfer(address, amountInUnits);
      console.info('[payment.mintTo] Transfer transaction submitted', {
        hash: tx.hash,
      });
      const receipt = await tx.wait();

      console.info('[payment.mintTo] Transfer transaction confirmed', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      return {
        mock: false,
        txHash: receipt.hash,
        amount,
        method,
      };
    }

    const tx = await contract.mint(address, amountInUnits);
    console.info('[payment.mintTo] Mint transaction submitted', {
      hash: tx.hash,
    });
    const receipt = await tx.wait();

    console.info('[payment.mintTo] Mint transaction confirmed', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
    });

    return {
      mock: false,
      txHash: receipt.hash,
      amount,
      method,
    };
  } catch (error) {
    const formattedError = formatMintError(error, {
      method,
      signerAddress: signer.address,
      tokenAddress: process.env.KPT_TOKEN_ADDRESS,
    });

    console.error('[payment.mintTo] Token distribution failed', {
      method,
      recipient: address,
      amount,
      treasuryAddress: signer.address,
      error:
        formattedError instanceof Error
          ? formattedError.message
          : 'Unknown token distribution error',
      rawError: error instanceof Error ? error.message : String(error),
    });

    throw formattedError;
  }
}
