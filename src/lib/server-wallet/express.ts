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
  let chain = "ETH";
  try {
    const obj = JSON.parse(init?.body as string) as { chain?: string };
    if (obj.chain) chain = obj.chain;
  } catch {}
  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
    "X-Magic-Secret-Key": process.env.SERVER_WALLET_SECRET_KEY ?? "",
    "X-OIDC-Provider-ID": process.env.NEXT_PUBLIC_OIDC_PROVIDER_ID ?? "",
    "X-Magic-Chain": chain,
    "X-Magic-Referrer": "https://demo.magic.link",
    ...(init?.headers || {}),
  };
  console.log(`[express] Request: ${init?.method || "GET"} ${TEE_BASE}${path}`);
  console.log(`[express] Headers:`, {
    "X-Magic-Chain": requestHeaders["X-Magic-Chain"],
    "X-OIDC-Provider-ID": requestHeaders["X-OIDC-Provider-ID"],
    "X-Magic-Secret-Key": requestHeaders["X-Magic-Secret-Key"] ? "sk_***" + requestHeaders["X-Magic-Secret-Key"].slice(-4) : "(empty)",
    Authorization: jwt ? "Bearer " + jwt.substring(0, 20) + "..." : "(empty)",
  });
  console.log(`[express] Body:`, init?.body);

  const response = await fetch(TEE_BASE + path, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });

  // Handle response validation and JSON parsing
  if (!response.ok) {
    const rawText = await response.text();
    console.error(`[express] TEE error on ${path}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: rawText,
    });

    let data: any = {};
    try { data = JSON.parse(rawText); } catch {}

    // For other errors, throw a generic error
    throw new Error(data.error || data.message || `HTTP error! status: ${response.status} - ${rawText}`);
  }

  return await response.json();
}
