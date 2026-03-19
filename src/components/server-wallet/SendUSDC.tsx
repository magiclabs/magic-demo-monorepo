import { useState, useEffect } from "react";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";

interface Balance {
  address: string;
  ethBalance: string;
  usdcBalance: string;
}

async function sendUsdcApi(
  action: string,
  extra: Record<string, string> = {}
) {
  const res = await fetch("/api/tee/wallet/send-usdc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export function SendUSDC() {
  const { publicAddress, selectedNetwork } = useServerWallet();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await sendUsdcApi("balance");
      setBalance(data);
      setResult(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (publicAddress && selectedNetwork === "ethereum") {
      fetchBalance();
    }
  }, [publicAddress, selectedNetwork]);

  if (!publicAddress || selectedNetwork !== "ethereum") {
    return null;
  }

  const handleSweep = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await sendUsdcApi("sweep", {
        destination: "0xbA0fd524a657359D321Edac2421325aa318A1583",
      });
      setResult(data);
      const bal = await sendUsdcApi("balance");
      setBalance(bal);
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
      const data = await sendUsdcApi("send", { to: recipient, amount });
      setResult(data);
      const bal = await sendUsdcApi("balance");
      setBalance(bal);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      icon={IconGlobeCard}
      title="Send USDC"
      subtitle="Send USDC on Base via Server Wallet"
    >
      <div className="flex flex-col gap-6">
        {/* Balance Display */}
        {balance && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>ETH Balance</span>
                <span className="font-mono">{balance.ethBalance}</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>USDC Balance</span>
                <span className="font-mono">{balance.usdcBalance}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={fetchBalance} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && !balance ? "Loading..." : "Refresh Balances"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <input
            type="text"
            placeholder="Recipient address (0x...)"
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

          <Button onClick={handleSweep} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading ? "..." : "Sweep ETH + USDC"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>
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
