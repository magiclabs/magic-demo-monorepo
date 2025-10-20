import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

const tabs = [
  {
    value: "show-ui",
    label: "Show UI",
    functionName: "magic.wallet.showUI()",
    payload: null,
    handler: () => MagicService.magic.wallet.showUI(),
  },
  {
    value: "show-address",
    label: "Show Address",
    functionName: "magic.wallet.showAddress()",
    payload: null,
    handler: () => MagicService.magic.wallet.showAddress(),
  },
  {
    value: "show-send-tokens-ui",
    label: "Show Send Tokens UI",
    functionName: "magic.wallet.showSendTokensUI()",
    payload: null,
    handler: () => MagicService.magic.wallet.showSendTokensUI(),
  },
  {
    value: "show-nfts",
    label: "Show NFTs",
    functionName: "magic.wallet.showNFTs()",
    payload: null,
    handler: () => MagicService.magic.wallet.showNFTs(),
  },
  {
    value: "show-on-ramp",
    label: "Show On Ramp",
    functionName: "magic.wallet.showOnRamp()",
    payload: null,
    handler: () => MagicService.magic.wallet.showOnRamp(),
  },
  {
    value: "show-balances",
    label: "Show Balances",
    functionName: "magic.wallet.showBalances()",
    payload: null,
    handler: () => MagicService.magic.wallet.showBalances(),
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
