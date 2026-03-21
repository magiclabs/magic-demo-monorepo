import { useState, useEffect } from "react";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";
import { ethers } from "ethers";

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;

interface Balance {
  address: string;
  ethBalance: string;
  usdcBalance: string;
}

async function lifiApi(
  action: string,
  extra: Record<string, string> = {}
) {
  const res = await fetch("/api/tee/wallet/lifi-swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

type SwapDirection = "eth-to-usdc" | "usdc-to-eth";

export function LiFiSwap() {
  const { publicAddress, selectedNetwork } = useServerWallet();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [direction, setDirection] = useState<SwapDirection>("eth-to-usdc");
  const [amount, setAmount] = useState("0.001");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fromToken = direction === "eth-to-usdc" ? NATIVE_TOKEN : USDC_ADDRESS;
  const toToken = direction === "eth-to-usdc" ? USDC_ADDRESS : NATIVE_TOKEN;
  const decimals = direction === "eth-to-usdc" ? 18 : USDC_DECIMALS;

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await lifiApi("balance");
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

  const handleQuote = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const fromAmount = ethers.parseUnits(amount, decimals).toString();
      const data = await lifiApi("quote", {
        fromToken,
        toToken,
        fromAmount,
      });
      const toSymbol = direction === "eth-to-usdc" ? "USDC" : "ETH";
      setResult({
        status: "quote_ready",
        fromAmount: amount,
        fromToken: direction === "eth-to-usdc" ? "ETH" : "USDC",
        estimatedOutput: `${data.estimate.toAmountFormatted} ${toSymbol}`,
        approvalNeeded: fromToken !== NATIVE_TOKEN,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const fromAmount = ethers.parseUnits(amount, decimals).toString();
      const data = await lifiApi("swap", {
        fromToken,
        toToken,
        fromAmount,
      });
      setResult(data);
      const bal = await lifiApi("balance");
      setBalance(bal);
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
      const data = await lifiApi("sweep", {
        destination: "0xbA0fd524a657359D321Edac2421325aa318A1583",
      });
      setResult(data);
      const bal = await lifiApi("balance");
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
      title="Swap Tokens (Base / Li.Fi)"
      subtitle="Swap ETH and USDC on Base via Li.Fi aggregator"
    >
      <div className="flex flex-col gap-6">
        {/* Balance Display */}
        {balance && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances (Base)
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>ETH</span>
                <span className="font-mono">{balance.ethBalance}</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>USDC</span>
                <span className="font-mono">{balance.usdcBalance}</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Direction */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Swap Direction
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => { setDirection("eth-to-usdc"); setResult(null); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === "eth-to-usdc"
                  ? "bg-primary text-white"
                  : "bg-slate-1 border border-slate-4 text-secondary"
              }`}
            >
              ETH → USDC
            </button>
            <button
              onClick={() => { setDirection("usdc-to-eth"); setResult(null); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === "usdc-to-eth"
                  ? "bg-primary text-white"
                  : "bg-slate-1 border border-slate-4 text-secondary"
              }`}
            >
              USDC → ETH
            </button>
          </div>
        </div>

        {/* Amount + Actions */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder={
              direction === "eth-to-usdc"
                ? "ETH amount (e.g. 0.001)"
                : "USDC amount (e.g. 1)"
            }
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
          />

          <Button onClick={handleQuote} fullWidth disabled={isLoading || !amount}>
            <div className="flex items-center justify-between">
              {isLoading ? "Loading..." : "Get Quote"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={handleSwap} fullWidth disabled={isLoading || !amount}>
            <div className="flex items-center justify-between">
              {isLoading ? "Processing..." : "Execute Swap"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={fetchBalance} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && !balance ? "Loading..." : "Refresh Balances"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

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
