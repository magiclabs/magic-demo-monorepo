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
        from: publicAddress,
        calls: [
          { to: "0x000000000000000000000000000000000000dEaD", value: "0x0", data: "0x" },
        ],
        capabilities: { eip7702Auth: true },
      },
      handler: handleSendTransaction,
    },
    {
      value: "batch-calls",
      label: "Batch Calls",
      functionName: "wallet_sendPreparedCalls (EIP-7702, batched)",
      payload: {
        from: publicAddress,
        calls: [
          { to: "0x000000000000000000000000000000000000dEaD", value: "0x0", data: "0x" },
          { to: "0x0000000000000000000000000000000000000000", value: "0x0", data: "0x" },
        ],
        capabilities: { eip7702Auth: true },
      },
      handler: handleBatchCalls,
    },
  ];

  return (
    <MethodsCard
      title="Smart Wallet Methods"
      description="Send gas-sponsored transactions via Alchemy EIP-7702 smart wallets on Base Sepolia"
      defaultTab="send-transaction"
      tabs={tabs}
    />
  );
}
