import { TeeEndpoint } from "./tee-types";

const TEE_BASE = "https://tee.express.magiclabs.com";

export async function tee(path: TeeEndpoint, jwt: string, init?: RequestInit) {
  const apiKey = "pk_live_BAF12F1CC6EBF5BE";
  const oidcProviderId = "3a9StGIjw0aLTsF4RKFgAeX9hkHJwa3LOXKnlmCLqFQ=";

  return fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      "X-Magic-API-Key": apiKey,
      "X-OIDC-Provider-ID": oidcProviderId,
      "X-Magic-Referrer":
        "https://nextauth-api-wallets-express-demo.vercel.app",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}
