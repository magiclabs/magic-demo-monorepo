import { useState, useEffect } from "react";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";
import { Magic } from "magic-sdk";
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { baseSepolia } from "viem/chains";
import { toAccount } from "viem/accounts";
import { ethers } from "ethers";
import type { Address, Hex } from "viem";

// x402 imports
import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";

const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_DECIMALS = 6;

const erc20Abi = [
  "function balanceOf(address account) view returns (uint256)",
];

// Isolated Magic instance for Base Sepolia
let baseSepoliaMagic: InstanceType<typeof Magic> | null = null;
function getBaseSepoliaMagic() {
  if (!baseSepoliaMagic) {
    baseSepoliaMagic = new Magic(
      process.env.NEXT_PUBLIC_MAGIC_EMBEDDED_WALLET_KEY ?? "",
      {
        network: {
          rpcUrl: "https://sepolia.base.org",
          chainId: 84532,
        },
      }
    );
  }
  return baseSepoliaMagic;
}

export function X402Payment() {
  const { publicAddress } = useEmbeddedWallet();
  const [url, setUrl] = useState("/api/x402/weather");
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("");

  const fetchBalances = async () => {
    if (!publicAddress) return;
    try {
      const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
      const ethBal = await provider.getBalance(publicAddress);
      setEthBalance(ethers.formatEther(ethBal));

      const usdc = new ethers.Contract(BASE_SEPOLIA_USDC, erc20Abi, provider);
      const usdcBal = await usdc.balanceOf(publicAddress);
      setUsdcBalance(ethers.formatUnits(usdcBal, USDC_DECIMALS));
    } catch {
      // ignore balance fetch errors
    }
  };

  useEffect(() => {
    if (publicAddress) fetchBalances();
  }, [publicAddress]);

  if (!publicAddress) return null;

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setStep("Setting up wallet...");
      const magic = getBaseSepoliaMagic();
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(magic.rpcProvider as any),
      });

      const [address] = await walletClient.getAddresses();

      // Create custom account that delegates signing to Magic
      const magicAccount = toAccount({
        address: address as Address,
        signMessage: async ({ message }) => {
          return walletClient.signMessage({
            message,
            account: address as Address,
          });
        },
        signTransaction: async (tx) => {
          return walletClient.signTransaction({
            ...tx,
            account: address as Address,
          } as any);
        },
        signTypedData: async ({ domain, types, primaryType, message }) => {
          return walletClient.signTypedData({
            domain: domain as any,
            types: types as any,
            primaryType: primaryType as string,
            message: message as any,
            account: address as Address,
          });
        },
      });

      // Set up x402 client
      setStep("Registering payment scheme...");
      const client = new x402Client();
      client.register("eip155:*", new ExactEvmScheme(magicAccount));
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      // Make paid request
      setStep("Making paid request...");
      const response = await fetchWithPayment(url, { method: "GET" });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed (${response.status}): ${text}`);
      }

      const data = await response.json();
      setResult({
        status: response.status,
        data,
        paidFrom: address,
      });
      setStep("");
      await fetchBalances();
    } catch (err) {
      setError(err as Error);
      setStep("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFree = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setStep("Making unpaid request...");
      const response = await fetch(url, { method: "GET" });
      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("json")
        ? await response.json()
        : await response.text();

      setResult({
        status: response.status,
        statusText: response.statusText,
        body,
        note:
          response.status === 402
            ? "Server requires payment! Use 'Pay & Fetch' to pay with x402."
            : undefined,
      });
      setStep("");
    } catch (err) {
      setError(err as Error);
      setStep("");
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
              {isLoading && step.includes("unpaid") ? step : "Fetch (No Payment)"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={handlePay} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && !step.includes("unpaid")
                ? step || "Processing..."
                : "Pay & Fetch (x402)"}
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
