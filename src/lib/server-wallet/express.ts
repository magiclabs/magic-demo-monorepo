import {
  TeeEndpoint as ExpressEndpoint,
  TeeProxyEndpoint,
} from "../../types/tee-types";

export const TEE_BASE = "https://tee.express.magiclabs.com";

/**
 * TEE client with integrated error handling and response management
 * @param path - The TEE endpoint path
 * @param jwt - JWT token for authentication
 * @param init - Optional fetch init options
 * @returns Parsed JSON data from the response
 * @throws Error if response is not ok or contains error information
 */
export async function express<T = any>(
  path: ExpressEndpoint,
  jwt: string,
  init?: RequestInit
): Promise<T> {
  const obj = JSON.parse(init?.body as string) as { chain: string };
  const response = await fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      "X-Magic-Secret-Key": process.env.MAGIC_API_KEY ?? "",
      "X-OIDC-Provider-ID": process.env.NEXT_PUBLIC_OIDC_PROVIDER_ID ?? "",
      "X-Magic-Chain": obj.chain,
      "X-Magic-Referrer": "https://demo.magic.link",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  // Handle response validation and JSON parsing
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    // For other errors, throw a generic error
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
