import { getOrCreateWallet as getOrCreateWalletAPI } from "./express-proxy";

const getOrCreateWallet = async (chain: string) => {
  
  const data = await getOrCreateWalletAPI(chain);
  
  return data.public_address;
};

export const walletService = {
  getOrCreateWallet,
};
