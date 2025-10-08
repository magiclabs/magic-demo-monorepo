import { solanaService } from "../../lib/api-wallet/solana";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { useApiWallet } from "@/contexts/ApiWalletContext";
import { Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TEE_BASE } from "@/lib/api-wallet/express";


export function SolanaSignMethods() {
  const { publicAddress, selectedNetwork } = useApiWallet();

  if (!publicAddress || selectedNetwork !== "solana") {
    return null;
  }

  const userPubkey = new PublicKey(publicAddress);
  
  // Create shared payload objects
  const messagePayload = "Hello Solana World!"
  
  const txPayload = {
    fromPubkey: publicAddress,
    toPubkey: publicAddress,
    lamports: LAMPORTS_PER_SOL * 0.001, // 0.001 SOL
  };

  // Message Signing - Simple String
  const handleSignSimpleMessage = async (): Promise<string> => {
    try {
      const result = await solanaService.solanaSignMessage(messagePayload);
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign simple message:", error);
      throw error;
    }
  };

  // Transaction Signing
  const handleSignTransaction = async (): Promise<string> => {
    try {
      const transaction = new Transaction({
        feePayer: userPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: userPubkey,
          lamports: txPayload.lamports,
        })
      );

      // Serialize the transaction message
      const messageBytes = transaction.serializeMessage();
      const { signature } = await solanaService.solanaSignTransaction(messageBytes);
      
      // Return the signature and transaction info
      const result = {
        signature,
        transaction: {
          type: "Transaction",
          from: userPubkey.toString(),
          to: userPubkey.toString(),
          amount: "0.001 SOL",
          messageBytes: Buffer.from(messageBytes).toString('base64'),
        }
      };
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign transaction:", error);
      throw error;
    }
  };

  const tabs = [
    {
      value: "simple-message",
      label: "Simple Message",
      functionName: `${TEE_BASE}/v1/sign/message`,
      payload: messagePayload,
      handler: handleSignSimpleMessage,
    },
    {
      value: "transaction",
      label: "Sign Transaction",
      functionName: `${TEE_BASE}/v1/sign/message`,
      payload: txPayload,
      handler: handleSignTransaction,
    },
  ];

  return (
    <SigningMethodsLayout
      title="Solana Signing Methods"
      description="Test Solana message and transaction signing with Magic API"
      defaultTab="simple-message"
      tabs={tabs}
    >
      <TabsContent value="simple-message" />
      <TabsContent value="transaction" />
    </SigningMethodsLayout>
  );
}
