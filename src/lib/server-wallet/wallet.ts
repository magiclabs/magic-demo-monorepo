import { getOrCreateWallet as getOrCreateWalletAPI } from "./express-proxy";

// UI-network -> API chain. EVM chains (e.g. Avalanche C-Chain) all resolve to the
// same "ETH" wallet, so "avalanche" is mapped to the "ETH" chain the API expects.
const NETWORK_TO_CHAIN: Record<string, string> = {
  avalanche: "ETH",
};

const getOrCreateWallet = async (network: string) => {
  const chain = NETWORK_TO_CHAIN[network] ?? network;

  const data = await getOrCreateWalletAPI(chain);

  return data.public_address;
};

export const walletService = {
  getOrCreateWallet,
};
