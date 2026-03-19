import { useState, useEffect } from "react";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";

interface MorphoPosition {
  address: string;
  ethBalance: string;
  usdcBalance: string;
  vaultShares: string;
  vaultValue: string;
}

async function morphoApi(action: string, extra: Record<string, string> = {}) {
  const res = await fetch("/api/tee/wallet/morpho", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export function MorphoYield() {
  const { publicAddress, selectedNetwork } = useServerWallet();
  const [position, setPosition] = useState<MorphoPosition | null>(null);
  const [depositAmount, setDepositAmount] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosition = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await morphoApi("position");
      setPosition(data);
      setResult(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch position on mount
  useEffect(() => {
    if (publicAddress && selectedNetwork === "ethereum") {
      fetchPosition();
    }
  }, [publicAddress, selectedNetwork]);

  if (!publicAddress || selectedNetwork !== "ethereum") {
    return null;
  }

  const handleDeposit = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await morphoApi("deposit", { amount: depositAmount });
      setResult(data);
      // Refresh position after deposit
      const pos = await morphoApi("position");
      setPosition(pos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await morphoApi("withdraw");
      setResult(data);
      // Refresh position after withdraw
      const pos = await morphoApi("position");
      setPosition(pos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      icon={IconGlobeCard}
      title="Morpho Yield"
      subtitle="Deposit USDC into Morpho Vaults on Base to earn yield"
    >
      <div className="flex flex-col gap-6">
        {/* Position Display */}
        {position && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Vault Position
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>ETH Balance</span>
                <span className="font-mono">{position.ethBalance}</span>
              </div>
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>USDC Balance</span>
                <span className="font-mono">{position.usdcBalance}</span>
              </div>
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>Vault Value</span>
                <span className="font-mono">{position.vaultValue} USDC</span>
              </div>
              <div className="flex justify-between text-xs text-secondary">
                <span>Shares</span>
                <span className="font-mono">{position.vaultShares}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={fetchPosition} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && !position ? "Loading..." : "Refresh Balances"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="USDC amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
            />
            <Button
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount}
            >
              <div className="flex items-center gap-2">
                {isLoading ? "..." : "Deposit"}
              </div>
            </Button>
          </div>

          <Button
            onClick={handleWithdraw}
            fullWidth
            disabled={isLoading || position?.vaultShares === "0"}
          >
            <div className="flex items-center justify-between">
              {isLoading ? "..." : "Withdraw All"}
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
