import { MagicService } from "../../lib/get-magic";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "../SigningMethodsLayout";
import * as web3 from "@solana/web3.js";

const SOLANA_SIGN_MESSAGE = "Hello Solana World!";
const SOLANA_RPC_URL = "https://api.devnet.solana.com";

export function SolanaSignMethods() {
  const handleGetPublicAddress = async (): Promise<string> => {
    const magic = MagicService.magic as any;
    const publicAddress = await magic.solana.getPublicAddress();
    return publicAddress
  };

  const handleSignMessage = async (): Promise<string> => {
    const magic = MagicService.magic as any;
    const signedMessage = await magic.solana.signMessage(SOLANA_SIGN_MESSAGE);
    return signedMessage;
  };

  const handleSignTransaction = async (): Promise<string> => {
    try {
      const magic = MagicService.magic as any;
      const connection = new web3.Connection(SOLANA_RPC_URL);
      
      // Get user's public key
      const publicAddress= await magic.solana.getPublicAddress();
      const userPublicKey = new web3.PublicKey(publicAddress);
      
      // Create a simple transfer transaction
      const recipientPubkey = new web3.Keypair().publicKey;
      
      const blockhash = await connection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error("Failed to get latest blockhash");
      }

      const transaction = new web3.Transaction({
        ...blockhash,
        feePayer: userPublicKey,
      }).add(
        web3.SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: recipientPubkey,
          lamports: web3.LAMPORTS_PER_SOL * 0.001, // 0.001 SOL
        })
      );

      const signedTransaction = await magic.solana.signTransaction(transaction, {
        requireAllSignatures: false,
        verifySignatures: true,
      });

      return `Transaction signed successfully. Signature: ${signedTransaction.signature}`;
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSignAndSendTransaction = async (): Promise<string> => {
    try {
      const magic = MagicService.magic as any;
      const connection = new web3.Connection(SOLANA_RPC_URL);
      
      // Get user's public address
      const publicAddress = await magic.solana.getPublicAddress();
      const userPublicKey = new web3.PublicKey(publicAddress);
      
      // Create a simple transfer transaction
      const recipientPubkey = new web3.Keypair().publicKey;
      
      const blockhash = await connection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error("Failed to get latest blockhash");
      }

      const transaction = new web3.Transaction({
        ...blockhash,
        feePayer: userPublicKey,
      }).add(
        web3.SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: recipientPubkey,
          lamports: web3.LAMPORTS_PER_SOL * 0.001, // 0.001 SOL
        })
      );

      const signedTransaction = await magic.solana.signTransaction(transaction, {
        requireAllSignatures: false,
        verifySignatures: true,
      });

      const signature = await connection.sendRawTransaction(
        Buffer.from(signedTransaction.rawTransaction, 'base64')
      );

      return `Transaction sent successfully. Signature: ${signature}`;
    } catch (error) {
      throw new Error(`Failed to sign and send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const tabs = [
    {
      value: "public-address",
      label: "Get Public Address",
      functionName: "magic.solana.getPublicAddress()",
      payload: null,
      handler: handleGetPublicAddress,
    },
    {
      value: "sign-message",
      label: "Sign Message",
      functionName: "magic.solana.signMessage(message)",
      payload: SOLANA_SIGN_MESSAGE,
      handler: handleSignMessage,
    },
    {
      value: "sign-transaction",
      label: "Sign Transaction",
      functionName: "magic.solana.signTransaction(transaction)",
      payload: {
        type: "SystemProgram.transfer",
        from: "user_public_key",
        to: "recipient_public_key",
        lamports: "0.001 SOL",
      },
      handler: handleSignTransaction,
    },
    {
      value: "sign-send-transaction",
      label: "Sign & Send Transaction",
      functionName: "magic.solana.signTransaction() + connection.sendRawTransaction()",
      payload: {
        type: "SystemProgram.transfer",
        from: "user_public_key",
        to: "recipient_public_key",
        lamports: "0.001 SOL",
        network: "devnet",
      },
      handler: handleSignAndSendTransaction,
    },
  ];

  return (
    <div className="space-y-4">
      <SigningMethodsLayout
        title="Solana Signing Methods"
        description="Test Solana-specific cryptographic operations with Magic SDK"
        defaultTab="public-address"
        tabs={tabs}
      >
        <TabsContent value="public-address" />
        <TabsContent value="sign-message" />
        <TabsContent value="sign-transaction" />
        <TabsContent value="sign-send-transaction" />
      </SigningMethodsLayout>
    </div>
  );
}
