export enum TeeEndpoint {
  WALLET = "/v1/wallet",
  SIGN_DATA = "/v1/wallet/sign/data",
  SIGN_MESSAGE = "/v1/wallet/sign/message",
}

export interface Wallet {
  address: string;
  chainId?: number | string;
  publicKey?: string;
  [k: string]: unknown;
}

export interface SignMessageRequest {
  message: string;
}
export interface SignMessageResponse {
  signature: string;
  algorithm?: string;
  [k: string]: unknown;
}

export interface SignTransactionRequest {
  txHex: string;
}
export interface SignTransactionResponse {
  signedTxHex?: string;
  signature?: string;
  txHash?: string;
  [k: string]: unknown;
}

export interface Transaction {
  hash: string;
  status?: "pending" | "success" | "failed" | string;
  [k: string]: unknown;
}

export interface TeeResult<T> {
  ok: boolean;
  status: number;
  data: T;
  contentType: string;
  headers: Headers;
}
