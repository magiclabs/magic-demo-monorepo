import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";

const tabs = [
  {
    value: "connect-with-ui",
    label: "Connect With UI",
    functionName: "magic.wallet.connectWithUI()",
    payload: null,
    handler: () => MagicService.magic.wallet.connectWithUI(),
  },
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
      icon={<WalletMethodsIcon />}
    />
  );
}

function WalletMethodsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 640 640"
    >
      <path d="M152 96C103.4 96 64 135.4 64 184L64 424C64 472.6 103.4 512 152 512L488 512C536.6 512 576 472.6 576 424L576 280C576 231.4 536.6 192 488 192L184 192C170.7 192 160 202.7 160 216C160 229.3 170.7 240 184 240L488 240C510.1 240 528 257.9 528 280L528 424C528 446.1 510.1 464 488 464L152 464C129.9 464 112 446.1 112 424L112 184C112 161.9 129.9 144 152 144L520 144C533.3 144 544 133.3 544 120C544 106.7 533.3 96 520 96L152 96zM448 384C465.7 384 480 369.7 480 352C480 334.3 465.7 320 448 320C430.3 320 416 334.3 416 352C416 369.7 430.3 384 448 384z" />
    </svg>
  );
}
