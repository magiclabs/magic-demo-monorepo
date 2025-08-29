import { TeeEndpoint } from "./tee-types";

const TEE_BASE = "https://tee.express.magiclabs.com";

export async function tee(path: TeeEndpoint, jwt: string, init?: RequestInit) {
  return fetch(TEE_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      "X-Magic-API-Key": process.env.MAGIC_API_KEY ?? "",
      "X-OIDC-Provider-ID": process.env.OIDC_PROVIDER_ID ?? "",
      "X-Magic-Referrer":
        "https://nextauth-api-wallets-express-demo.vercel.app",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}
