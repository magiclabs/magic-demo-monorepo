import { express } from "@/lib/server-wallet/express";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";

// Devnet USDC mint (from spl-token-faucet.com)
const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const USDC_DECIMALS = 6;
const SOLANA_RPC_URL = "https://api.devnet.solana.com";

const connection = new Connection(SOLANA_RPC_URL);

async function signAndSend(jwt: string, walletAddress: string, transaction: Transaction) {
  const walletPubkey = new PublicKey(walletAddress);

  // Serialize the transaction message as base64
  const messageBytes = transaction.serializeMessage();
  const messageBase64 = Buffer.from(messageBytes).toString("base64");

  console.log("[send-usdc-sol] Signing transaction via TEE...");
  const { signature } = await express<{ signature: string }>(
    TeeEndpoint.SIGN_MESSAGE,
    jwt,
    {
      method: "POST",
      body: JSON.stringify({
        message_base64: messageBase64,
        chain: "SOL",
      }),
    }
  );

  // Attach signature to the transaction
  const sigBytes = signature.startsWith("0x")
    ? Buffer.from(signature.slice(2), "hex")
    : Buffer.from(signature, "base64");
  transaction.addSignature(walletPubkey, sigBytes);

  // Broadcast
  const txSignature = await connection.sendRawTransaction(transaction.serialize());
  console.log("[send-usdc-sol] Tx signature:", txSignature);

  await connection.confirmTransaction(txSignature);
  console.log("[send-usdc-sol] Confirmed");

  return txSignature;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.idToken) {
      return NextResponse.json(
        { error: "Authentication required", requiresReauth: true },
        { status: 401 }
      );
    }
    const jwt = session.idToken;

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    console.log("[send-usdc-sol] Action:", action);

    // Get wallet address
    const { public_address: walletAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "SOL" }),
    });
    console.log("[send-usdc-sol] Wallet:", walletAddress);

    const walletPubkey = new PublicKey(walletAddress);

    // Balance
    if (action === "balance") {
      const lamports = await connection.getBalance(walletPubkey);
      const solBalance = (lamports / LAMPORTS_PER_SOL).toString();

      let usdcBalance = "0";
      const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
      try {
        const account = await getAccount(connection, ata);
        usdcBalance = (Number(account.amount) / 10 ** USDC_DECIMALS).toString();
      } catch {
        // ATA doesn't exist
      }

      const result = {
        address: walletAddress,
        solBalance,
        usdcBalance,
      };
      console.log("[send-usdc-sol] Balance:", JSON.stringify(result));
      return NextResponse.json(result);
    }

    // Send
    if (action === "send") {
      const { to, amount } = body;
      if (!to || !amount) {
        return NextResponse.json(
          { error: "to and amount are required" },
          { status: 400 }
        );
      }

      const recipient = new PublicKey(to);
      const transferAmount = BigInt(
        Math.round(parseFloat(amount) * 10 ** USDC_DECIMALS)
      );
      console.log("[send-usdc-sol] Sending", amount, "USDC to", to);

      const senderATA = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
      const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient);

      const blockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        ...blockhash,
        feePayer: walletPubkey,
      });

      // Create recipient ATA if needed
      try {
        await getAccount(connection, recipientATA);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            walletPubkey,
            recipientATA,
            recipient,
            USDC_MINT
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          senderATA,
          recipientATA,
          walletPubkey,
          transferAmount
        )
      );

      const txSignature = await signAndSend(jwt, walletAddress, transaction);

      return NextResponse.json({
        signature: txSignature,
        action: "send",
        to,
        amount,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[send-usdc-sol] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
