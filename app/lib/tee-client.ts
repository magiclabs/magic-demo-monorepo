import { TeeEndpoint } from "./tee-types";

const TEE_BASE = "https://tee.express.magiclabs.com";
const AUTH = `Bearer ${process.env.TEE_SERVER_TOKEN}`;

export async function teeFetch(path: TeeEndpoint, init?: RequestInit) {
  return fetch(TEE_BASE + path, {
    ...init,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}
