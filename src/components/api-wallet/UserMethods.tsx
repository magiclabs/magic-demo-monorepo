import { useApiWallet } from "@/contexts/ApiWalletContext";
import MagicApiWalletSDK, { WalletType } from "@magic-sdk/api-wallets";
import { MethodsCard } from "../MethodsCard";

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
  const magic = new MagicApiWalletSDK("pk_live_BAF12F1CC6EBF5BE");

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
  solana: "SOLANA",
  sol: "SOLANA",
};

export function networkToWalletType(network?: string): WalletType {
  if (!network) return "ETH";
  return NETWORK_TO_TYPE[network.toLowerCase()];
}
