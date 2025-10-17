import { MethodsCard } from "@/components/MethodsCard";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

function PolkadotMethodsIcon() {
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

export default function PolkadotMethods() {
  const { publicAddress } = useEmbeddedWallet();
  const tabs = [
    {
      value: "get-account",
      label: "Get Account",
      functionName: "magic.polkadot.getAccount()",
      payload: null,
      handler: async () => {
        return await MagicService.magic.polkadot.getAccount();
      },
    },
    // {
    //   value: "send-transaction",
    //   label: "Send Transaction",
    //   functionName: "magic.polkadot.sendTransaction()",
    //   payload: null,
    //   handler: async () => {
    //     return await MagicService.magic.polkadot.sendTransaction(
    //       publicAddress as string,
    //       1
    //     );
    //   },
    // },
  ];

  return (
    <MethodsCard
      title="Polkadot Methods"
      description="Test Polkadot methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<PolkadotMethodsIcon />}
    />
  );
}
