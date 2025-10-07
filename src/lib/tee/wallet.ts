import { tee } from "../tee-client";
import { TeeEndpoint } from "../../types/tee-types";

const getOrCreateWallet = async (jwt: string, walletType: string) => {
  
  const data = await tee(TeeEndpoint.WALLET, jwt, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",  
      "X-Magic-Chain": walletType,
    },
  });
  
  return data.public_address;
};

export const walletService = {
  getOrCreateWallet,
};
