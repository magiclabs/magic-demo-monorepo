import { useApiWallet } from "@/contexts/ApiWalletContext";
import MagicApiWalletSDK from "@magiclabs/magic-api-wallets";
import { MethodsCard } from "../MethodsCard";
import { WalletType } from "node_modules/@magiclabs/magic-api-wallets/dist/types/api-wallets-types";

export default function UserMethods() {
  const { selectedNetwork, session } = useApiWallet();
  const oidcProviderId = process.env.NEXT_PUBLIC_OIDC_PROVIDER_ID ?? "";

  const tabs = [
    {
      value: "reveal-private-key",
      label: "Reveal Private Key",
      functionName:
        "magic.wallet.exportPrivateKey({ walletType, bearerToken })",
      payload: null,
      handler: () =>
        revealPrivateKey(
          networkToWalletType(selectedNetwork ?? "ETH"),
          session?.idToken,
          oidcProviderId
        ),
    },
  ];

  return (
    <MethodsCard
      title="User Methods"
      description="Test various user methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
    />
  );
}

async function revealPrivateKey(
  walletType: WalletType,
  bearerToken?: string,
  oidcProviderId?: string
) {
  if (!bearerToken || !oidcProviderId) return;
  const magic = new MagicApiWalletSDK("pk_live_A8F1C027AB2D1143", {
    endpoint: "https://embedded-wallet-k04wrf742-magiclabs.vercel.app/",
  });

  await magic.wallet.exportPrivateKey({
    walletType,
    bearerToken,
    oidcProviderId,
  });
}

const NETWORK_TO_TYPE: Record<string, WalletType> = {
  ethereum: "ETH",
  eth: "ETH",
  bitcoin: "BITCOIN",
  btc: "BITCOIN",
  flow: "FLOW",
  icon: "ICON",
  harmony: "HARMONY",
  solana: "SOLANA",
  sol: "SOLANA",
  zilliqa: "ZILLIQA",
  zil: "ZILLIQA",
  taquito: "TAQUITO",
  algod: "ALGOD",
  polkadot: "POLKADOT",
  dot: "POLKADOT",
  tezos: "TEZOS",
  avax: "AVAX",
  avalanche: "AVAX",
  ed: "ED",
  conflux: "CONFLUX",
  terra: "TERRA",
  hedera: "HEDERA",
  near: "NEAR",
  cosmos: "COSMOS",
  aptos: "APTOS",
  sui: "SUI",
  kadena: "KADENA",
};

export function networkToWalletType(network?: string): WalletType {
  if (!network) return "ETH";
  return NETWORK_TO_TYPE[network.toLowerCase()];
}
