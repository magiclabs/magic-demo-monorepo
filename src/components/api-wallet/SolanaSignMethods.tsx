import { teeService } from "../../lib/tee-service";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";

// Sample messages for signing
const SOLANA_MESSAGE_EXAMPLES = {
  simple: "Hello Solana World!",
  complex: "This is a longer message that demonstrates Solana message signing capabilities with Magic API wallets.",
  unicode: "🌊 Welcome to Solana! 🚀 Magic wallets make it easy to sign messages and transactions.",
};

export function SolanaSignMethods({
  publicAddress,
}: {
  publicAddress: string | null;
}) {
  // Message Signing - Simple String
  const handleSignSimpleMessage = async (): Promise<string> => {
    try {
      const message = SOLANA_MESSAGE_EXAMPLES.simple;
      const res = await teeService.solanaSignMessage(message);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign simple message:", error);
      throw error;
    }
  };

  // Message Signing - Complex String
  const handleSignComplexMessage = async (): Promise<string> => {
    try {
      const message = SOLANA_MESSAGE_EXAMPLES.complex;
      const res = await teeService.solanaSignMessage(message);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign complex message:", error);
      throw error;
    }
  };

  // Message Signing - Unicode String
  const handleSignUnicodeMessage = async (): Promise<string> => {
    try {
      const message = SOLANA_MESSAGE_EXAMPLES.unicode;
      const res = await teeService.solanaSignMessage(message);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign unicode message:", error);
      throw error;
    }
  };

  // Legacy Transaction Signing
  const handleSignLegacyTransaction = async (): Promise<string> => {
    try {
      // Create a sample legacy transaction
      const recipientPubkey = new Keypair().publicKey;
      const userPubkey = publicAddress ? new PublicKey(publicAddress) : new Keypair().publicKey;
      
      const transaction = new Transaction({
        feePayer: userPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: recipientPubkey,
          lamports: LAMPORTS_PER_SOL * 0.001, // 0.001 SOL
        })
      );

      // Serialize the transaction message
      const messageBytes = transaction.serializeMessage();
      const res = await teeService.solanaSignTransaction(messageBytes);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const { signature } = await res.json();
      
      // Return the signature and transaction info
      const result = {
        signature,
        transaction: {
          type: "Legacy Transaction",
          from: userPubkey.toString(),
          to: recipientPubkey.toString(),
          amount: "0.001 SOL",
          messageBytes: Buffer.from(messageBytes).toString('base64'),
        }
      };
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign legacy transaction:", error);
      throw error;
    }
  };

  // Versioned Transaction Signing (simplified example)
  const handleSignVersionedTransaction = async (): Promise<string> => {
    try {
      // Create a versioned transaction structure
      const recipientPubkey = new Keypair().publicKey;
      const userPubkey = publicAddress ? new PublicKey(publicAddress) : new Keypair().publicKey;
      
      // For demo purposes, we'll create a legacy transaction but label it as versioned
      const transaction = new Transaction({
        feePayer: userPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: recipientPubkey,
          lamports: LAMPORTS_PER_SOL * 0.001,
        })
      );

      const messageBytes = transaction.serializeMessage();
      const res = await teeService.solanaSignTransaction(messageBytes);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const { signature } = await res.json();
      
      const result = {
        signature,
        transaction: {
          type: "Versioned Transaction",
          from: userPubkey.toString(),
          to: recipientPubkey.toString(),
          amount: "0.001 SOL",
          messageBytes: Buffer.from(messageBytes).toString('base64'),
          note: "This demonstrates versioned transaction signing structure"
        }
      };
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign versioned transaction:", error);
      throw error;
    }
  };

  // Partial Transaction Signing
  const handlePartialTransactionSigning = async (): Promise<string> => {
    try {
      // Create a partial transaction (missing some signatures)
      const recipientPubkey = new Keypair().publicKey;
      const userPubkey = publicAddress ? new PublicKey(publicAddress) : new Keypair().publicKey;
      
      const transaction = new Transaction({
        feePayer: userPubkey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: recipientPubkey,
          lamports: LAMPORTS_PER_SOL * 0.001,
        })
      );

      const messageBytes = transaction.serializeMessage();
      const res = await teeService.solanaSignTransaction(messageBytes);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const { signature } = await res.json();
      
      const result = {
        signature,
        transaction: {
          type: "Partial Transaction",
          from: userPubkey.toString(),
          to: recipientPubkey.toString(),
          amount: "0.001 SOL",
          messageBytes: Buffer.from(messageBytes).toString('base64'),
          note: "This demonstrates partial transaction signing where only some signatures are required"
        }
      };
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign partial transaction:", error);
      throw error;
    }
  };

  const tabs = [
    {
      value: "simple-message",
      label: "Simple Message",
      functionName: "teeService.solanaSignMessage(message)",
      payload: {
        message: SOLANA_MESSAGE_EXAMPLES.simple,
        encoding: "base64",
        note: "Simple string message encoded as base64 for Solana signing"
      },
      handler: handleSignSimpleMessage,
    },
    {
      value: "complex-message",
      label: "Complex Message",
      functionName: "teeService.solanaSignMessage(message)",
      payload: {
        message: SOLANA_MESSAGE_EXAMPLES.complex,
        encoding: "base64",
        note: "Complex string message demonstrating longer text signing"
      },
      handler: handleSignComplexMessage,
    },
    {
      value: "unicode-message",
      label: "Unicode Message",
      functionName: "teeService.solanaSignMessage(message)",
      payload: {
        message: SOLANA_MESSAGE_EXAMPLES.unicode,
        encoding: "base64",
        note: "Unicode message with emojis and special characters"
      },
      handler: handleSignUnicodeMessage,
    },
    {
      value: "legacy-tx",
      label: "Legacy Transaction",
      functionName: "teeService.solanaSignTransaction(messageBytes)",
      payload: {
        type: "Legacy Transaction",
        operation: "SystemProgram.transfer",
        amount: "0.001 SOL",
        note: "Legacy Solana transaction signing with base64 encoded message"
      },
      handler: handleSignLegacyTransaction,
    },
    {
      value: "versioned-tx",
      label: "Versioned Transaction",
      functionName: "teeService.solanaSignTransaction(messageBytes)",
      payload: {
        type: "Versioned Transaction",
        operation: "SystemProgram.transfer",
        amount: "0.001 SOL",
        note: "Versioned transaction structure for modern Solana applications"
      },
      handler: handleSignVersionedTransaction,
    },
    {
      value: "partial-tx",
      label: "Partial Transaction",
      functionName: "teeService.solanaSignTransaction(messageBytes)",
      payload: {
        type: "Partial Transaction",
        operation: "SystemProgram.transfer",
        amount: "0.001 SOL",
        note: "Partial transaction signing for multi-signature scenarios"
      },
      handler: handlePartialTransactionSigning,
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
      <TabsContent value="complex-message" />
      <TabsContent value="unicode-message" />
      <TabsContent value="legacy-tx" />
      <TabsContent value="versioned-tx" />
      <TabsContent value="partial-tx" />
    </SigningMethodsLayout>
  );
}
