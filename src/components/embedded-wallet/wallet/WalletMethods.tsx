import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

const tabs = [
  {
    value: "show-on-ramp",
    label: "Show On Ramp",
    functionName: "magic.wallet.showOnRamp()",
    payload: null,
    handler: () => MagicService.magic.wallet.showOnRamp(),
  },
];

export function WalletMethods() {
  return (
    <MethodsCard
      title="Wallet Methods"
      description="Test wallet methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
    />
  );
}
