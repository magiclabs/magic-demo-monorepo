import { useState, useEffect } from "react";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";

interface AavePosition {
  address: string;
  ethBalance: string;
  usdcBalance: string;
  aTokenBalance: string;
}

async function aaveApi(action: string, extra: Record<string, string> = {}) {
  const res = await fetch("/api/tee/wallet/aave-yield", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export function AaveYield() {
  const { publicAddress, selectedNetwork } = useServerWallet();
  const [position, setPosition] = useState<AavePosition | null>(null);
  const [supplyAmount, setSupplyAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosition = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await aaveApi("position");
      setPosition(data);
      setResult(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (publicAddress && selectedNetwork === "ethereum") {
      fetchPosition();
    }
  }, [publicAddress, selectedNetwork]);

  if (!publicAddress || selectedNetwork !== "ethereum") {
    return null;
  }

  const handleSupply = async () => {
    if (!supplyAmount) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await aaveApi("supply", { amount: supplyAmount });
      setResult(data);
      const pos = await aaveApi("position");
      setPosition(pos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (withdrawAll = false) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const extra: Record<string, string> = {};
      if (!withdrawAll && withdrawAmount) {
        extra.amount = withdrawAmount;
      }
      const data = await aaveApi("withdraw", extra);
      setResult(data);
      const pos = await aaveApi("position");
      setPosition(pos);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSweep = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await aaveApi("sweep");
      setResult(data);
      const pos = await aaveApi("position");
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
      title="Yield on AAVE (Base)"
      subtitle="Supply USDC to AAVE V3 to earn yield"
    >
      <div className="flex flex-col gap-6">
        {/* Balances */}
        {position && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances (Base)
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>ETH</span>
                <span className="font-mono">{position.ethBalance}</span>
              </div>
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>USDC (wallet)</span>
                <span className="font-mono">{position.usdcBalance}</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>aUSDC (supplied)</span>
                <span className="font-mono">{position.aTokenBalance}</span>
              </div>
            </div>
          </div>
        )}

        {/* Supply */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Supply
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="USDC amount"
              value={supplyAmount}
              onChange={(e) => setSupplyAmount(e.target.value)}
              className="flex-1 rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
            />
            <Button
              onClick={handleSupply}
              disabled={isLoading || !supplyAmount}
            >
              <div className="flex items-center gap-2">
                {isLoading ? "..." : "Supply"}
              </div>
            </Button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Withdraw
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="USDC amount (leave empty for all)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
            />
            <Button
              onClick={() => handleWithdraw(false)}
              disabled={isLoading || !withdrawAmount}
            >
              <div className="flex items-center gap-2">
                {isLoading ? "..." : "Withdraw"}
              </div>
            </Button>
          </div>
          <Button
            onClick={() => handleWithdraw(true)}
            fullWidth
            disabled={isLoading}
          >
            <div className="flex items-center justify-between">
              {isLoading ? "..." : "Withdraw All"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>
        </div>

        {/* Utility Buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={fetchPosition} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              Refresh Balances
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={handleSweep} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading ? "..." : "Sweep All + AAVE → Wallet"}
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
