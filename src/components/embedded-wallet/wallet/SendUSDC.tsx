import { useState } from "react";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { JsonBlock } from "@/components/CodeBlock";
import IconGlobeCard from "public/icons/icon-globe-card.svg";
import Image from "next/image";
import IconWand from "public/icons/icon-wand.svg";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";

// Base USDC (native, issued by Circle)
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;

const erc20Abi = [
  "function transfer(address to, uint256 value) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
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

export function SendUSDC() {
  const { publicAddress } = useEmbeddedWallet();
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!publicAddress) return null;

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const provider = getBaseProvider();
      const erc20 = new ethers.Contract(USDC_ADDRESS, erc20Abi, provider);
      const bal = await erc20.balanceOf(publicAddress);
      const formatted = ethers.formatUnits(bal, USDC_DECIMALS);
      setUsdcBalance(formatted);
      setResult({ address: publicAddress, network: "base", usdcBalance: formatted });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const SWEEP_DEST = "0xbA0fd524a657359D321Edac2421325aa318A1583";

  const handleSweep = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const provider = getBaseProvider();
      const signer = await provider.getSigner();
      const results: Record<string, string> = {};

      // Send all USDC
      const erc20 = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
      const usdcBal = await erc20.balanceOf(publicAddress);
      if (usdcBal > 0n) {
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
        const tx = await signer.sendTransaction({
          to: SWEEP_DEST,
          value: ethToSend,
        });
        const receipt = await tx.wait();
        results.ethTx = receipt!.hash;
      }

      setResult({ action: "sweep", ...results });
      setUsdcBalance("0.0");
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
      const provider = getBaseProvider();
      const signer = await provider.getSigner();
      const erc20 = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
      const value = ethers.parseUnits(amount, USDC_DECIMALS);

      const tx = await erc20.transfer(recipient, value);
      const receipt = await tx.wait();

      setResult({
        txHash: receipt.hash,
        action: "send",
        network: "base",
        to: recipient,
        amount,
      });

      // Refresh balance
      const bal = await erc20.balanceOf(publicAddress);
      setUsdcBalance(ethers.formatUnits(bal, USDC_DECIMALS));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      icon={IconGlobeCard}
      title="Send USDC (Base)"
      subtitle="Send USDC on Base via Embedded Wallet"
    >
      <div className="flex flex-col gap-6">
        {/* Balance Display */}
        {usdcBalance !== null && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              USDC Balance (Base)
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary">
                <span>USDC</span>
                <span className="font-mono">{usdcBalance}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={fetchBalance} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && usdcBalance === null
                ? "Loading..."
                : "Refresh Balance"}
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
