import { useApiWallet } from "@/contexts/ApiWalletContext";
import MagicApiWalletSDK from "@magiclabs/magic-api-wallets";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MethodsCard } from "../MethodsCard";

export default function UserMethods() {
  const { selectedNetwork, session } = useApiWallet();

  const tabs = [
    {
      value: "reveal-private-key",
      label: "Reveal Private Key",
      functionName:
        "magic.wallet.exportPrivateKey({ walletType, bearerToken })",
      payload: null,
      handler: () => revealPrivateKey("ETH", session?.idToken),
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

async function revealPrivateKey(walletType: string, bearerToken?: string) {
  if (!bearerToken) return;
  const magic = new MagicApiWalletSDK("pk_live_A8F1C027AB2D1143", {
    endpoint: "http://localhost:3024",
  });

  await magic.wallet.exportPrivateKey({ walletType, bearerToken });
}
