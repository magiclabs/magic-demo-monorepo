import { useState } from "react";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";
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

export function SendUSDCSolana() {
  const { publicAddress, selectedNetwork } = useEmbeddedWallet();
  const [solBalance, setSolBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!publicAddress || selectedNetwork !== "solana") return null;

  const connection = new Connection(SOLANA_RPC_URL);
  const userPublicKey = new PublicKey(publicAddress);

  const fetchBalances = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      // SOL balance
      const lamports = await connection.getBalance(userPublicKey);
      const sol = (lamports / LAMPORTS_PER_SOL).toString();
      setSolBalance(sol);

      // USDC balance
      const ata = await getAssociatedTokenAddress(USDC_MINT, userPublicKey);
      try {
        const account = await getAccount(connection, ata);
        const usdc = (Number(account.amount) / 10 ** USDC_DECIMALS).toString();
        setUsdcBalance(usdc);
      } catch {
        setUsdcBalance("0");
      }

      setResult({
        address: publicAddress,
        network: "solana-devnet",
        solBalance: sol,
        usdcBalance: usdcBalance ?? "0",
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const recipientPubkey = new PublicKey(recipient);
      const transferAmount = BigInt(
        Math.round(parseFloat(amount) * 10 ** USDC_DECIMALS)
      );

      const senderATA = await getAssociatedTokenAddress(
        USDC_MINT,
        userPublicKey
      );
      const recipientATA = await getAssociatedTokenAddress(
        USDC_MINT,
        recipientPubkey
      );

      const blockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        ...blockhash,
        feePayer: userPublicKey,
      });

      // Create recipient ATA if needed
      try {
        await getAccount(connection, recipientATA);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey,
            recipientATA,
            recipientPubkey,
            USDC_MINT
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          senderATA,
          recipientATA,
          userPublicKey,
          transferAmount
        )
      );

      const magic = MagicService.magic as any;
      const signedTransaction = await magic.solana.signTransaction(
        transaction,
        {
          requireAllSignatures: false,
          verifySignatures: true,
        }
      );

      const signature = await connection.sendRawTransaction(
        Buffer.from(signedTransaction.rawTransaction, "base64")
      );

      await connection.confirmTransaction({
        signature,
        ...blockhash,
      });

      setResult({
        signature,
        action: "send",
        network: "solana-devnet",
        to: recipient,
        amount,
      });

      // Refresh balances
      await fetchBalances();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      icon={IconGlobeCard}
      title="Send USDC (Solana Devnet)"
      subtitle="Send USDC on Solana devnet via Embedded Wallet"
    >
      <div className="flex flex-col gap-6">
        {/* Balance Display */}
        {(solBalance !== null || usdcBalance !== null) && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>SOL</span>
                <span className="font-mono">{solBalance ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>USDC</span>
                <span className="font-mono">{usdcBalance ?? "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={fetchBalances} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && solBalance === null
                ? "Loading..."
                : "Refresh Balances"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <input
            type="text"
            placeholder="Recipient address (Solana)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="USDC amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !recipient || !amount}
            >
              <div className="flex items-center gap-2">
                {isLoading ? "..." : "Send"}
              </div>
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Result
            </label>
            <div className="relative">
              <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30">
                <JsonBlock
                  data={JSON.stringify(result, null, 2)}
                  maxHeight="16rem"
                />
              </div>
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Error
            </label>
            <div className="relative">
              <div className="p-4 rounded-xl bg-gradient-to-r from-error/10 to-red-500/10 border border-error/30">
                <JsonBlock
                  data={JSON.stringify(
                    { message: error.message, name: error.name },
                    null,
                    2
                  )}
                  maxHeight="16rem"
                />
              </div>
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
