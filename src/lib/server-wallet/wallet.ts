import { getOrCreateWallet as getOrCreateWalletAPI } from "./express-proxy";

const getOrCreateWallet = async (chain: string) => {
  
  const apiChain = chain.toLowerCase() === "bitcoin" ? "BTC" : chain;
  
  const data = await getOrCreateWalletAPI(apiChain);
  
  // For Bitcoin, the API returns "address|privateKey" format
  if (chain.toLowerCase() === "bitcoin" || chain.toLowerCase() === "btc") {
    const [address] = data.public_address.split("|");
    return address;
  }
  
  return data.public_address;
};

export const walletService = {
  getOrCreateWallet,
};