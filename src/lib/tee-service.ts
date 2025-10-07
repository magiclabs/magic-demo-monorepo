import { tee } from "./tee-client";
import { TeeEndpoint } from "../types/tee-types";


const getOrCreateWallet = async (jwt: string) => {
  const res = await tee(TeeEndpoint.WALLET, jwt, {
    method: "POST",
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // If the response indicates re-authentication is needed, throw a specific error
    if (data.requiresReauth) {
      const error = new Error(data.error || "Authentication required");
      (error as any).requiresReauth = true;
      throw error;
    }
    // For other errors, throw a generic error
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.public_address;
};


export const teeService = {
  getOrCreateWallet,
};
