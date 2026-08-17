import {
  JsonRpcProvider,
  Network,
  parseEther,
  TransactionRequest,
} from "ethers";
import { ethereumService } from "./ethereum";

/**
 * Avalanche C-Chain (Fuji testnet) example for Server Wallets.
 *
 * Why no Fridge/TEE changes are needed: the Server Wallet EVM key is a single
 * secp256k1 keypair, and the TEE sign endpoint (`/v2/wallet/sign/data`) signs a
 * raw 32-byte hash — it is chain-agnostic. Avalanche C-Chain is a standard EVM
 * chain, so "supporting" it is entirely client-side:
 *   1. The wallet address is identical to the Ethereum address (same key), so we
 *      request/sign against chain "ETH" (see ethereumService, which hardcodes it).
 *   2. We set the Avalanche chainId (43113 for Fuji) on the transaction. ethers
 *      bakes that into `unsignedHash`, so the signature is only valid on Avalanche.
 *   3. We connect an RPC provider to Fuji to populate nonce/fees and broadcast.
 *
 * Note: `X-Magic-Chain` stays "ETH" for every call — Fridge only accepts
 * BTC/ETH/SOL/HEDERA/COSMOS, so an "AVALANCHE" chain value would be rejected.
 */
export const AVALANCHE_FUJI = {
  chainId: 43113,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  explorer: "https://testnet.snowtrace.io",
  faucet: "https://faucet.avax.network",
  nativeSymbol: "AVAX",
} as const;

// staticNetwork avoids repeated eth_chainId round-trips since the network is fixed.
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
 * Build an EIP-1559 transaction on Avalanche Fuji, sign it with the Server Wallet
 * TEE key (via the EVM sign endpoint), and broadcast it to the Fuji RPC.
 *
 * The wallet must hold test AVAX first — fund `from` at {@link AVALANCHE_FUJI.faucet}.
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
    type: 2, // EIP-1559 — C-Chain supports it; keeps `v` a clean y-parity.
    gasLimit: 21000, // exact cost of a plain native-value transfer
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  };

  // ethereumService.signTransaction computes the unsigned hash (chainId included),
  // sends it to the TEE (`chain: "ETH"`), and returns the serialized signed tx.
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
  // Message + typed-data signing is identical to Ethereum (same EVM key).
  personalSign: ethereumService.personalSign,
  signTypedDataV1: ethereumService.signTypedDataV1,
  signTypedDataV3: ethereumService.signTypedDataV3,
  signTypedDataV4: ethereumService.signTypedDataV4,
  signTransaction: ethereumService.signTransaction,
  // Avalanche-specific: broadcast a real transaction on Fuji.
  sendTransaction,
  getBalance,
  config: AVALANCHE_FUJI,
};
