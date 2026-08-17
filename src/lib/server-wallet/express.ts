import { TeeEndpoint as ExpressEndpoint } from "../../types/tee-types";

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
  init?: RequestInit,
): Promise<T> {
  let chain = "ETH";
  try {
    const obj = JSON.parse(init?.body as string) as { chain?: string };
    if (obj.chain) chain = obj.chain;
  } catch {}
  const response = await fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      "X-Magic-API-Key": process.env.NEXT_PUBLIC_MAGIC_SERVER_WALLET_KEY ?? "",
      "X-OIDC-Provider-ID": process.env.NEXT_PUBLIC_OIDC_PROVIDER_ID ?? "",
      "X-Magic-Chain": chain,
      "X-Magic-Referrer": "https://demo.magic.link",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  // Handle response validation and JSON parsing
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    // Fridge/Express API returns errors as `{ detail: ... }`; fall back to `error`
    // then a generic message so the real cause isn't swallowed.
    const rawMessage = data.detail ?? data.error;
    const message =
      typeof rawMessage === "string"
        ? rawMessage
        : rawMessage
          ? JSON.stringify(rawMessage)
          : `HTTP error! status: ${response.status}`;

    throw new Error(message);
  }

  return await response.json();
}
