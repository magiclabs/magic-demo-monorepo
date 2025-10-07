import { TeeEndpoint } from "../types/tee-types";

const TEE_BASE = "https://tee.express.magiclabs.com";

/**
 * TEE client with integrated error handling and response management
 * @param path - The TEE endpoint path
 * @param jwt - JWT token for authentication
 * @param init - Optional fetch init options
 * @returns Parsed JSON data from the response
 * @throws Error if response is not ok or contains error information
 */
export async function tee<T = any>(path: TeeEndpoint, jwt: string, init?: RequestInit): Promise<T> {
  const response = await fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      "X-Magic-API-Key": process.env.MAGIC_API_KEY ?? "",
      "X-Magic-Chain": "ETH",
      "X-OIDC-Provider-ID": process.env.OIDC_PROVIDER_ID ?? "",
      "X-Magic-Referrer":
        "https://nextauth-api-wallets-express-demo.vercel.app",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  // Handle response validation and JSON parsing
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    
    // If the response indicates re-authentication is needed, throw a specific error
    if (data.requiresReauth) {
      const error = new Error(data.error || "Authentication required");
      (error as any).requiresReauth = true;
      throw error;
    }
    
    // For other errors, throw a generic error
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
