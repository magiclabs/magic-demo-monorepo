import { useState, useEffect } from "react";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";

async function x402Api(action: string, extra: Record<string, string> = {}) {
  const res = await fetch("/api/tee/wallet/x402-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export function X402Payment() {
  const { publicAddress, selectedNetwork } = useServerWallet();
  const [url, setUrl] = useState("/api/x402/weather");
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = async () => {
    try {
      const data = await x402Api("balance");
      setEthBalance(data.ethBalance);
      setUsdcBalance(data.usdcBalance);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (publicAddress && selectedNetwork === "ethereum") {
      fetchBalances();
    }
  }, [publicAddress, selectedNetwork]);

  if (!publicAddress || selectedNetwork !== "ethereum") {
    return null;
  }

  const handleFree = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      // For server wallet, the URL needs to be absolute for the API route to fetch it
      const absoluteUrl = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;
      const data = await x402Api("free", { url: absoluteUrl });
      setResult(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const absoluteUrl = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;
      const data = await x402Api("pay", { url: absoluteUrl });
      setResult(data);
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
      title="x402 Payments (Base Sepolia)"
      subtitle="Pay for API access with USDC via x402 protocol"
    >
      <div className="flex flex-col gap-6">
        {/* Balances */}
        {(ethBalance || usdcBalance) && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances (Base Sepolia)
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>ETH</span>
                <span className="font-mono">{ethBalance ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>USDC</span>
                <span className="font-mono">{usdcBalance ?? "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* URL Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            x402 Endpoint
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleFree} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading ? "Loading..." : "Fetch (No Payment)"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={handlePay} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading ? "Processing..." : "Pay & Fetch (x402)"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={fetchBalances} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              Refresh Balances
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
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${
                  result.status === 402
                    ? "from-warning/10 to-amber-500/10 border border-warning/30"
                    : "from-success/10 to-emerald-500/10 border border-success/30"
                }`}
              >
                <JsonBlock
                  data={JSON.stringify(result, null, 2)}
                  maxHeight="16rem"
                />
              </div>
              <div className="absolute top-3 right-3">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    result.status === 402 ? "bg-warning" : "bg-success"
                  }`}
                ></div>
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
