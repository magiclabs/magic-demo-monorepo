import { TeeEndpoint } from "./tee-types";

const TEE_BASE = "https://tee.express.magiclabs.com";

export async function teeFetch(
  path: TeeEndpoint,
  jwt: string,
  init?: RequestInit
) {
  return fetch(TEE_BASE + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
      "X-Magic-API-Key": "pk_live_BAF12F1CC6EBF5BE",
      "X-OIDC-Provider-ID": "3a9StGIjw0aLTsF4RKFgAeX9hkHJwa3LOXKnlmCLqFQ=",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}
