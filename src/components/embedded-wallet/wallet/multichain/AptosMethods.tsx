import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { AptosExtension } from "@magic-ext/aptos";
import { Magic } from "magic-sdk";

function AptosMethodsIcon() {
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

// const magic = new Magic("pk_live_493172A4D3AFF148", {
//   extensions: [
//     new AptosExtension({
//       nodeUrl: "https://fullnode.testnet.aptoslabs.com",
//     }),
//   ],
// });

export default function AptosMethods() {
  const tabs = [
    {
      value: "get-account",
      label: "Get Account",
      functionName: "magic.aptos.getAccount()",
      payload: null,
      handler: () => MagicService.magic.aptos.getAccount(),
    },
  ];

  return (
    <MethodsCard
      title="Aptos Methods"
      description="Test Aptos methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
      icon={<AptosMethodsIcon />}
    />
  );
}
