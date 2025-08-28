import { TeeEndpoint } from "./tee-types";

const TEE_BASE = "https://tee.express.magiclabs.com";

export async function teeFetch(path: TeeEndpoint, init?: RequestInit) {
  const apiKey = process.env.MAGIC_API_KEY || "pk_live_C1F8F341B021CD3B";
  const oidcProviderId = "3a9StGIjw0aLTsF4RKFgAeX9hkHJwa3LOXKnlmCLqFQ=";

  return fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Magic-API-Key": apiKey,
      "X-OIDC-Provider-ID": oidcProviderId,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}
