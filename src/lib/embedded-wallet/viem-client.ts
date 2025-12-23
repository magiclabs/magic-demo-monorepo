import { createWalletClient, createPublicClient, createClient, custom, http, publicActions, formatUnits, defineChain } from 'viem';
import { tempo } from 'tempo.ts/chains';
import { tempoActions, Actions } from 'tempo.ts/viem';
import { MagicService } from './get-magic';

export const TIP20_TOKEN = '0x20c0000000000000000000000000000000000001' as const;
const TEMPO_CHAIN_ID = 42429;

// TIP-20 token ABI for transfer
export const TIP20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

// Simple chain definition for Magic wallet client (standard EVM format)
const tempoSimple = defineChain({
  id: TEMPO_CHAIN_ID,
  name: 'Tempo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' },
  },
});

// Public client for read-only operations (balance, etc.)
export const publicClient = createPublicClient({
  chain: tempoSimple,
  transport: http(),
});

// Extended client with Tempo-specific actions (faucet, token operations)
export const tempoClient = createClient({
  chain: tempo({ feeToken: TIP20_TOKEN }),
  transport: http(),
})
  .extend(publicActions)
  .extend(tempoActions());

// Wallet client for signing with Magic's provider (uses simple chain def for compatibility)
export async function getMagicWalletClient() {
  // Switch Magic's provider to Tempo chain before creating the wallet client
  await MagicService.magic.evm.switchChain(TEMPO_CHAIN_ID);

  return createWalletClient({
    chain: tempoSimple,
    transport: custom(MagicService.magic.rpcProvider),
  });
}

// Request funds from Tempo testnet faucet
export async function requestFaucetFunds(address: `0x${string}`): Promise<{
  funded: boolean;
  balance: string;
  receipts?: string[];
}> {
  // Request funds from faucet
  const receipts = await Actions.faucet.fundSync(tempoClient, { account: address });

  const newBalance = await Actions.token.getBalance(tempoClient, {
    token: TIP20_TOKEN,
    account: address,
  });

  return {
    funded: true,
    balance: formatUnits(newBalance, 18),
    receipts: receipts.map((r) => r.transactionHash),
  };
}

// Get TIP-20 token balance (formatted string)
export async function getTempoBalance(address: `0x${string}`): Promise<string> {
  const balance = await Actions.token.getBalance(tempoClient, {
    token: TIP20_TOKEN,
    account: address,
  });
  return formatUnits(balance, 18);
}

// Get TIP-20 token balance (raw bigint)
export async function getTempoBalanceRaw(address: `0x${string}`): Promise<bigint> {
  return await Actions.token.getBalance(tempoClient, {
    token: TIP20_TOKEN,
    account: address,
  });
}