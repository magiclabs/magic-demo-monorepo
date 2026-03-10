import { MethodsCard } from "@/components/MethodsCard";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { sendSmartWalletTransaction } from "../../lib/server-wallet/express-proxy";

export function AlchemySmartWallet() {
  const { publicAddress, selectedNetwork } = useServerWallet();

  if (!publicAddress || selectedNetwork !== "ethereum") {
    return null;
  }

  const handleSendTransaction = async (): Promise<string> => {
    const result = await sendSmartWalletTransaction("single");
    return JSON.stringify(result, null, 2);
  };

  const handleBatchCalls = async (): Promise<string> => {
    const result = await sendSmartWalletTransaction("batch");
    return JSON.stringify(result, null, 2);
  };

  const tabs = [
    {
      value: "send-transaction",
      label: "Send Transaction",
      functionName: "wallet_sendPreparedCalls (EIP-7702)",
      payload: {
        chain: "Base Sepolia",
        to: "0x...dEaD",
        value: "0x0",
        sponsored: true,
      },
      handler: handleSendTransaction,
    },
    {
      value: "batch-calls",
      label: "Batch Calls",
      functionName: "wallet_sendPreparedCalls (EIP-7702, batched)",
      payload: {
        chain: "Base Sepolia",
        calls: [
          { to: "0x...dEaD", value: "0x0" },
          { to: "0x...0000", value: "0x0" },
        ],
        sponsored: true,
      },
      handler: handleBatchCalls,
    },
  ];

  return (
    <MethodsCard
      title="Alchemy Smart Wallet"
      description="EIP-7702 smart wallet with gas sponsorship and call batching on Base Sepolia"
      defaultTab="send-transaction"
      tabs={tabs}
    />
  );
}
