import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

function AvalancheMethodsIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

export default function AvalancheMethods() {
  const { publicAddress } = useEmbeddedWallet();
  const tabs = [
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.avax.signTransaction()",
      payload: null,
      handler: async () => {
        let assetId = "nznftJBicce1PfWQeNEVBmDyweZZ6zcM3p78z9Hy9Hhdhfaxm";

        let fromAddresses = [publicAddress];
        let toAddresses = [publicAddress];
        let sendAmount = 1000000;

        return await MagicService.magic.avax.signTransaction(
          sendAmount,
          assetId,
          toAddresses,
          fromAddresses,
          toAddresses
        );
      },
    },
  ];
  return (
    <MethodsCard
      title="Avalanche Methods"
      description="Test Avalanche methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<AvalancheMethodsIcon />}
    />
  );
}
