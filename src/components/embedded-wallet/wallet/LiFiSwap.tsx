import { useState, useEffect } from "react";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";

const LIFI_API = "https://li.quest/v1";
const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;

const erc20Abi = [
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
];

// Isolated Magic instance for Base
let baseMagic: InstanceType<typeof Magic> | null = null;
function getBaseMagic() {
  if (!baseMagic) {
    baseMagic = new Magic(
      process.env.NEXT_PUBLIC_MAGIC_EMBEDDED_WALLET_KEY ?? "",
      {
        network: {
          rpcUrl: "https://mainnet.base.org",
          chainId: 8453,
        },
      }
    );
  }
  return baseMagic;
}

function getBaseProvider() {
  return new ethers.BrowserProvider(getBaseMagic().rpcProvider as any);
}

type SwapDirection = "eth-to-usdc" | "usdc-to-eth";

export function LiFiSwap() {
  const { publicAddress } = useEmbeddedWallet();
  const [direction, setDirection] = useState<SwapDirection>("eth-to-usdc");
  const [amount, setAmount] = useState("0.001");
  const [quote, setQuote] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("");
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

  const fromToken = direction === "eth-to-usdc" ? NATIVE_TOKEN : USDC_ADDRESS;
  const toToken = direction === "eth-to-usdc" ? USDC_ADDRESS : NATIVE_TOKEN;
  const decimals = direction === "eth-to-usdc" ? 18 : USDC_DECIMALS;

  const fetchBalances = async () => {
    if (!publicAddress) return;
    try {
      const provider = getBaseProvider();
      const ethBal = await provider.getBalance(publicAddress);
      setEthBalance(ethers.formatEther(ethBal));

      const erc20 = new ethers.Contract(USDC_ADDRESS, erc20Abi, provider);
      const usdcBal = await erc20.balanceOf(publicAddress);
      setUsdcBalance(ethers.formatUnits(usdcBal, USDC_DECIMALS));
    } catch {
      // ignore balance fetch errors
    }
  };

  useEffect(() => {
    if (publicAddress) fetchBalances();
  }, [publicAddress]);

  if (!publicAddress) return null;

  const handleGetQuote = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setQuote(null);
    setStep("Getting quote...");
    try {
      const fromAmount = ethers.parseUnits(amount, decimals).toString();
      const params = new URLSearchParams({
        fromChain: "8453",
        toChain: "8453",
        fromToken,
        toToken,
        fromAmount,
        fromAddress: publicAddress,
        slippage: "0.005",
      });

      const res = await fetch(`${LIFI_API}/quote?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Quote failed: ${res.status}`);

      setQuote(data);
      const toAmount = direction === "eth-to-usdc"
        ? ethers.formatUnits(data.estimate.toAmount, USDC_DECIMALS)
        : ethers.formatEther(data.estimate.toAmount);
      const toSymbol = direction === "eth-to-usdc" ? "USDC" : "ETH";

      setResult({
        status: "quote_ready",
        fromAmount: amount,
        fromToken: direction === "eth-to-usdc" ? "ETH" : "USDC",
        estimatedOutput: `${toAmount} ${toSymbol}`,
        approvalNeeded: fromToken !== NATIVE_TOKEN,
      });
      setStep("");
    } catch (err) {
      setError(err as Error);
      setStep("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!quote) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const provider = getBaseProvider();
      const signer = await provider.getSigner();

      // Approve if swapping ERC-20
      if (fromToken !== NATIVE_TOKEN && quote.estimate.approvalAddress) {
        setStep("Checking allowance...");
        const erc20 = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
        const fromAmount = ethers.parseUnits(amount, decimals);
        const allowance = await erc20.allowance(publicAddress, quote.estimate.approvalAddress);

        if (allowance < fromAmount) {
          setStep("Approving token spend...");
          const approveTx = await erc20.approve(quote.estimate.approvalAddress, fromAmount);
          await approveTx.wait();
        }
      }

      // Execute swap
      setStep("Sending swap transaction...");
      const tx = await signer.sendTransaction({
        to: quote.transactionRequest.to,
        data: quote.transactionRequest.data,
        value: quote.transactionRequest.value,
        gasLimit: quote.transactionRequest.gasLimit,
      });

      setStep("Waiting for confirmation...");
      const receipt = await tx.wait();

      const toAmount = direction === "eth-to-usdc"
        ? ethers.formatUnits(quote.estimate.toAmount, USDC_DECIMALS)
        : ethers.formatEther(quote.estimate.toAmount);
      const toSymbol = direction === "eth-to-usdc" ? "USDC" : "ETH";

      setResult({
        status: "success",
        txHash: receipt!.hash,
        fromAmount: `${amount} ${direction === "eth-to-usdc" ? "ETH" : "USDC"}`,
        estimatedReceived: `${toAmount} ${toSymbol}`,
      });
      setQuote(null);
      setStep("");

      // Refresh balances
      await fetchBalances();
    } catch (err) {
      setError(err as Error);
      setStep("");
    } finally {
      setIsLoading(false);
    }
  };

  const SWEEP_DEST = "0xbA0fd524a657359D321Edac2421325aa318A1583";

  const handleSweep = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStep("Sweeping...");
    try {
      const provider = getBaseProvider();
      const signer = await provider.getSigner();
      const results: Record<string, string> = {};

      // Send all USDC
      const erc20 = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
      const usdcBal = await erc20.balanceOf(publicAddress);
      if (usdcBal > 0n) {
        setStep("Sending USDC...");
        const tx = await erc20.transfer(SWEEP_DEST, usdcBal);
        const receipt = await tx.wait();
        results.usdcTx = receipt.hash;
      }

      // Send remaining ETH minus gas
      const ethBal = await provider.getBalance(publicAddress!);
      const feeData = await provider.getFeeData();
      const maxFee = feeData.maxFeePerGas ?? 0n;
      const gasCost = 21000n * maxFee * 3n;
      const ethToSend = ethBal - gasCost;

      if (ethToSend > 0n) {
        setStep("Sending ETH...");
        const tx = await signer.sendTransaction({
          to: SWEEP_DEST,
          value: ethToSend,
        });
        const receipt = await tx.wait();
        results.ethTx = receipt!.hash;
      }

      setResult({ action: "sweep", ...results });
      setStep("");
      await fetchBalances();
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
      title="Swap Tokens (Base / Li.Fi)"
      subtitle="Swap ETH and USDC on Base via Li.Fi aggregator"
    >
      <div className="flex flex-col gap-6">
        {/* Balances */}
        {(ethBalance || usdcBalance) && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances (Base)
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

        {/* Swap Direction */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Swap Direction
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => { setDirection("eth-to-usdc"); setQuote(null); setResult(null); }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === "eth-to-usdc"
                  ? "bg-primary text-white"
                  : "bg-slate-1 border border-slate-4 text-secondary"
              }`}
            >
              ETH → USDC
            </button>
            <button
              onClick={() => { setDirection("usdc-to-eth"); setQuote(null); setResult(null); }}
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
            placeholder={direction === "eth-to-usdc" ? "ETH amount (e.g. 0.001)" : "USDC amount (e.g. 1)"}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setQuote(null); }}
            className="rounded-lg px-4 py-3 text-sm bg-slate-1 border border-slate-4 text-primary font-mono"
          />

          <Button onClick={handleGetQuote} fullWidth disabled={isLoading || !amount}>
            <div className="flex items-center justify-between">
              {isLoading && !quote ? step || "Loading..." : "Get Quote"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          {quote && (
            <Button onClick={handleSwap} fullWidth disabled={isLoading}>
              <div className="flex items-center justify-between">
                {isLoading ? step || "Processing..." : "Execute Swap"}
                <Image src={IconWand} alt="Wand" width={22} height={22} />
              </div>
            </Button>
          )}

          <Button onClick={fetchBalances} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              Refresh Balances
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={handleSweep} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && step.startsWith("S") ? step : "Sweep ETH + USDC"}
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
