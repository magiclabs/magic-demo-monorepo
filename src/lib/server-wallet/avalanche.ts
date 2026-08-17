import {
  JsonRpcProvider,
  Network,
  parseEther,
  TransactionRequest,
} from "ethers";
import { ethereumService } from "./ethereum";

/**
 * Avalanche C-Chain (Fuji testnet) support for Server Wallets.
 *
 * Avalanche C-Chain is EVM-compatible and shares the same address and key as
 * Ethereum, so message and typed-data signing reuse `ethereumService`. Sending a
 * transaction sets the Fuji chainId, signs with the Server Wallet, and broadcasts
 * over an RPC connection to Fuji.
 */
export const AVALANCHE_FUJI = {
  chainId: 43113,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  explorer: "https://testnet.snowtrace.io",
  nativeSymbol: "AVAX",
} as const;

// Fixed network, so skip the provider's auto-detection round-trips.
const provider = new JsonRpcProvider(
  AVALANCHE_FUJI.rpcUrl,
  new Network("avalanche-fuji", AVALANCHE_FUJI.chainId),
  { staticNetwork: true },
);

export interface SendTransactionResult {
  txHash: string;
  explorerUrl: string;
  from: string;
  to: string;
  value: string;
  chainId: number;
}

/**
 * Build an EIP-1559 transaction on Avalanche Fuji, sign it with the Server
 * Wallet, and broadcast it. The wallet must hold test AVAX first.
 */
async function sendTransaction(
  from: string,
  to: string,
  amountAvax: string,
): Promise<SendTransactionResult> {
  const [nonce, feeData] = await Promise.all([
    provider.getTransactionCount(from, "pending"),
    provider.getFeeData(),
  ]);

  const tx: TransactionRequest = {
    from,
    to,
    value: parseEther(amountAvax),
    nonce,
    chainId: AVALANCHE_FUJI.chainId,
    type: 2, // EIP-1559
    gasLimit: 21000, // exact cost of a native-value transfer
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  };

  // Sign with the Server Wallet key, then broadcast the signed tx to Fuji.
  const signedTx = await ethereumService.signTransaction(tx);
  const response = await provider.broadcastTransaction(signedTx);

  return {
    txHash: response.hash,
    explorerUrl: `${AVALANCHE_FUJI.explorer}/tx/${response.hash}`,
    from,
    to,
    value: `${amountAvax} ${AVALANCHE_FUJI.nativeSymbol}`,
    chainId: AVALANCHE_FUJI.chainId,
  };
}

async function getBalance(address: string): Promise<string> {
  const balance = await provider.getBalance(address);
  return balance.toString();
}

export const avalancheService = {
  // Message and typed-data signing are identical to Ethereum (same EVM key).
  personalSign: ethereumService.personalSign,
  signTypedDataV1: ethereumService.signTypedDataV1,
  signTypedDataV3: ethereumService.signTypedDataV3,
  signTypedDataV4: ethereumService.signTypedDataV4,
  signTransaction: ethereumService.signTransaction,
  sendTransaction,
  getBalance,
  config: AVALANCHE_FUJI,
};
