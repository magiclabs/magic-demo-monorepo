import { MethodsCard } from "@/components/MethodsCard";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { useEmbeddedWallet, Network } from "@/contexts/EmbeddedWalletContext";

// Map Network enum to chain IDs for EVM networks
const networkToChainId: Partial<Record<Network, number>> = {
  [Network.POLYGON]: 137,
  [Network.ETHEREUM]: 1,
  [Network.OPTIMISM]: 10,
  [Network.TEMPO]: 42429,
};

export function WalletMethods() {
  const { selectedNetwork } = useEmbeddedWallet();

  // Helper to switch chain before calling wallet methods (for EVM networks)
  const withChainSwitch = async (walletMethod: () => Promise<any>) => {
    const chainId = networkToChainId[selectedNetwork];
    if (chainId) {
      await MagicService.magic.evm.switchChain(chainId);
    }
    return walletMethod();
  };

  const tabs = [
    {
      value: "show-ui",
      label: "Show UI",
      functionName: "magic.wallet.showUI()",
      payload: null,
      handler: () => withChainSwitch(() => MagicService.magic.wallet.showUI()),
    },
    {
      value: "show-address",
      label: "Show Address",
      functionName: "magic.wallet.showAddress()",
      payload: null,
      handler: () => withChainSwitch(() => MagicService.magic.wallet.showAddress()),
    },
    {
      value: "show-send-tokens-ui",
      label: "Show Send Tokens UI",
      functionName: "magic.wallet.showSendTokensUI()",
      payload: null,
      handler: () => withChainSwitch(() => MagicService.magic.wallet.showSendTokensUI()),
    },
    {
      value: "show-nfts",
      label: "Show NFTs",
      functionName: "magic.wallet.showNFTs()",
      payload: null,
      handler: () => withChainSwitch(() => MagicService.magic.wallet.showNFTs()),
    },
    {
      value: "show-on-ramp",
      label: "Show On Ramp",
      functionName: "magic.wallet.showOnRamp()",
      payload: null,
      handler: () => withChainSwitch(() => MagicService.magic.wallet.showOnRamp()),
    },
    {
      value: "show-balances",
      label: "Show Balances",
      functionName: "magic.wallet.showBalances()",
      payload: null,
      handler: () => withChainSwitch(() => MagicService.magic.wallet.showBalances()),
    },
  ];

  return (
    <MethodsCard
      title="Wallet Methods"
      description="Test wallet methods with Magic SDK"
      defaultTab={tabs[0].value}
      tabs={tabs}
    />
  );
}
