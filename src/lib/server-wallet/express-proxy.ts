import { TeeEndpoint } from "../../types/tee-types";
import { getSession } from "next-auth/react";

const TEE_BASE = "https://tee.express.magiclabs.com";

export class AuthError extends Error {}

/**
 * TEE client that calls the TEE backend directly from the browser.
 * Uses the NextAuth session JWT for authorization and the public API key.
 */
async function express<T = any>(
  path: TeeEndpoint,
  init?: RequestInit,
): Promise<T> {
  const session = await getSession();

  if (!session?.idToken) {
    throw new AuthError("Authentication required");
  }

  if (session.error === "RefreshAccessTokenError") {
    throw new AuthError("Token refresh failed. Please sign in again.");
  }

  let chain = "ETH";
  try {
    const obj = JSON.parse(init?.body as string) as { chain?: string };
    if (obj.chain) chain = obj.chain;
  } catch {}

  const response = await fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.idToken}`,
      "X-Magic-API-Key": process.env.NEXT_PUBLIC_MAGIC_SERVER_WALLET_KEY ?? "",
      "X-OIDC-Provider-ID": process.env.NEXT_PUBLIC_OIDC_PROVIDER_ID ?? "",
      "X-Magic-Chain": chain,
      "X-Magic-Referrer": "https://demo.magic.link",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    if (data.requiresReauth) {
      throw new AuthError(data.error || "Authentication required");
    }

    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Wrapper functions for TEE API endpoints
 */

export interface SignDataRequest {
  raw_data_hash: string;
  chain: string;
}

export interface SignDataResponse {
  r: string;
  s: string;
  v: number;
}

export interface SignMessageRequest {
  message_base64: string;
  chain: string;
}

export interface SignMessageResponse {
  signature: string;
  [k: string]: unknown;
}

export interface WalletResponse {
  public_address: string;
  [k: string]: unknown;
}

/**
 * Sign data with the TEE wallet
 */
export async function signData(
  rawDataHash: string,
  chain: string,
): Promise<SignDataResponse> {
  const body: SignDataRequest = { raw_data_hash: rawDataHash, chain };
  return await express<SignDataResponse>(TeeEndpoint.SIGN_DATA, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Sign a message with the TEE wallet
 */
export async function signMessage(
  messageBase64: string,
  chain: string,
): Promise<SignMessageResponse> {
  const body: SignMessageRequest = { message_base64: messageBase64, chain };
  return await express<SignMessageResponse>(TeeEndpoint.SIGN_MESSAGE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Get or create a wallet with the TEE
 */
export async function getOrCreateWallet(
  chain: string,
): Promise<WalletResponse> {
  const body = { chain };
  return await express<WalletResponse>(TeeEndpoint.WALLET, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface SmartWalletResponse {
  txHash: string;
  mode: string;
  callCount: number;
  chain: string;
  sponsored: boolean;
}

export async function sendSmartWalletTransaction(
  mode: "single" | "batch" = "single",
): Promise<SmartWalletResponse> {
  // Smart wallet stays server-side (Alchemy SDK + secret keys)
  const response = await fetch("/api/tee/wallet/smart-wallet", {
    method: "POST",
    body: JSON.stringify({ mode }),
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
