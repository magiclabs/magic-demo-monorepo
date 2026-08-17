import { getOrCreateWallet as getOrCreateWalletAPI } from "./express-proxy";

// UI-network -> API chain. EVM chains (e.g. Avalanche C-Chain) all resolve to the
// single "ETH" secp256k1 wallet; Fridge rejects any chain outside its known set,
// so "avalanche" must be mapped rather than sent through as-is.
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
