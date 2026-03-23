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
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { base } from "viem/chains";
import { AaveClient, bigDecimal, evmAddress } from "@aave/client";
import { supply, withdraw } from "@aave/client/actions";

const AAVE_POOL = evmAddress("0xA238Dd80C259a72e81d7e4664a9801593F98d1c5");
const USDC_ADDRESS_RAW = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_ADDRESS = evmAddress(USDC_ADDRESS_RAW);
const USDC_DECIMALS = 6;
const SWEEP_DEST = "0xbA0fd524a657359D321Edac2421325aa318A1583";
const BASE_CHAIN_ID = 8453 as const;

const erc20Abi = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
];

const poolAbi = [
  "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
  "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
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
      },
    );
  }
  return baseMagic;
}

function getBaseProvider() {
  return new ethers.BrowserProvider(getBaseMagic().rpcProvider as any);
}

function getViemClients() {
  const walletClient = createWalletClient({
    chain: base,
    transport: custom(getBaseMagic().rpcProvider as any),
  });
  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });
  return { walletClient, publicClient };
}

const aaveClient = AaveClient.create();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executePlan(
  plan: any,
  walletClient: any,
  publicClient: any,
  account: `0x${string}`,
  onStep?: (step: string) => void,
) {
  if (plan.__typename === "ApprovalRequired") {
    onStep?.("Approving...");
    const approveHash = await walletClient.sendTransaction({
      to: plan.approval.to,
      value: BigInt(plan.approval.value),
      data: plan.approval.data,
      account,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    onStep?.("Sending transaction...");
    const hash = await walletClient.sendTransaction({
      to: plan.originalTransaction.to,
      value: BigInt(plan.originalTransaction.value),
      data: plan.originalTransaction.data,
      account,
    });
    return await publicClient.waitForTransactionReceipt({ hash });
  }

  if (plan.__typename === "TransactionRequest") {
    onStep?.("Sending transaction...");
    const hash = await walletClient.sendTransaction({
      to: plan.to,
      value: BigInt(plan.value),
      data: plan.data,
      account,
    });
    return await publicClient.waitForTransactionReceipt({ hash });
  }

  if (plan.__typename === "InsufficientBalanceError") {
    throw new Error(`Insufficient balance: ${plan.required.value} required`);
  }

  throw new Error(`Unhandled plan type: ${plan.__typename}`);
}

export function AaveYield() {
  const { publicAddress } = useEmbeddedWallet();
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [aTokenBalance, setATokenBalance] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [supplyAmount, setSupplyAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("");

  const fetchBalances = async () => {
    if (!publicAddress) return;
    try {
      const provider = getBaseProvider();

      const ethBal = await provider.getBalance(publicAddress);
      setEthBalance(ethers.formatEther(ethBal));

      const usdc = new ethers.Contract(USDC_ADDRESS_RAW, erc20Abi, provider);
      const usdcBal = await usdc.balanceOf(publicAddress);
      setUsdcBalance(ethers.formatUnits(usdcBal, USDC_DECIMALS));

      const pool = new ethers.Contract(AAVE_POOL as string, poolAbi, provider);
      const reserveData = await pool.getReserveData(USDC_ADDRESS_RAW);

      const aToken = new ethers.Contract(
        reserveData.aTokenAddress,
        erc20Abi,
        provider,
      );
      const aBal = await aToken.balanceOf(publicAddress);
      setATokenBalance(ethers.formatUnits(aBal, USDC_DECIMALS));
    } catch {
      // ignore balance fetch errors
    }
  };

  useEffect(() => {
    if (publicAddress) fetchBalances();
  }, [publicAddress]);

  if (!publicAddress) return null;

  const handleSupply = async () => {
    if (!supplyAmount) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setStep("Getting supply plan...");
      const { walletClient, publicClient } = getViemClients();

      const result = await supply(aaveClient, {
        market: AAVE_POOL,
        amount: {
          erc20: {
            currency: USDC_ADDRESS,
            value: supplyAmount,
          },
        },
        sender: evmAddress(publicAddress),
        supplier: evmAddress(publicAddress),
        chainId: BASE_CHAIN_ID,
      } as any);

      if (result.isErr()) {
        throw new Error(`Supply failed: ${result.error}`);
      }

      const receipt = await executePlan(
        result.value,
        walletClient,
        publicClient,
        publicAddress as `0x${string}`,
        setStep,
      );

      setResult({
        action: "supply",
        txHash: receipt.transactionHash,
        amount: `${supplyAmount} USDC`,
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

  const handleWithdraw = async (withdrawAll = false) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      setStep("Getting withdraw plan...");
      const { walletClient, publicClient } = getViemClients();

      const result = await withdraw(aaveClient, {
        market: AAVE_POOL,
        amount: {
          erc20: {
            currency: USDC_ADDRESS,
            value: { exact: withdrawAll ? aTokenBalance || "0" : withdrawAmount },
          },
        },
        sender: evmAddress(publicAddress),
        chainId: BASE_CHAIN_ID,
      } as any);

      if (result.isErr()) {
        throw new Error(`Withdraw failed: ${result.error}`);
      }

      const receipt = await executePlan(
        result.value,
        walletClient,
        publicClient,
        publicAddress as `0x${string}`,
        setStep,
      );

      setResult({
        action: "withdraw",
        txHash: receipt.transactionHash,
        amount: withdrawAll ? "all" : `${withdrawAmount} USDC`,
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

  const handleSweep = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const provider = getBaseProvider();
      const signer = await provider.getSigner();
      const results: Record<string, string> = {};

      // Withdraw all from AAVE first
      const pool = new ethers.Contract(AAVE_POOL as string, poolAbi, provider);
      const reserveData = await pool.getReserveData(USDC_ADDRESS_RAW);
      const aToken = new ethers.Contract(
        reserveData.aTokenAddress,
        erc20Abi,
        provider,
      );
      const aBal = await aToken.balanceOf(publicAddress);

      if (aBal > BigInt(0)) {
        setStep("Withdrawing from AAVE...");
        const poolWithSigner = new ethers.Contract(
          AAVE_POOL as string,
          poolAbi,
          signer,
        );
        const tx = await poolWithSigner.withdraw(
          USDC_ADDRESS_RAW,
          ethers.MaxUint256,
          publicAddress,
        );
        const receipt = await tx.wait();
        results.aaveWithdrawTx = receipt.hash;
      }

      // Send all USDC
      const usdc = new ethers.Contract(USDC_ADDRESS_RAW, erc20Abi, signer);
      const usdcBal = await usdc.balanceOf(publicAddress);
      if (usdcBal > BigInt(0)) {
        setStep("Sending USDC...");
        const tx = await usdc.transfer(SWEEP_DEST, usdcBal);
        const receipt = await tx.wait();
        results.usdcTx = receipt.hash;
      }

      // Send remaining ETH minus gas
      const ethBal = await provider.getBalance(publicAddress!);
      const feeData = await provider.getFeeData();
      const maxFee = feeData.maxFeePerGas ?? BigInt(0);
      const gasCost = BigInt(21000) * maxFee * BigInt(3);
      const ethToSend = ethBal - gasCost;

      if (ethToSend > BigInt(0)) {
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
      title="Yield on AAVE (Base)"
      subtitle="Supply USDC to AAVE V3 to earn yield"
    >
      <div className="flex flex-col gap-6">
        {/* Balances */}
        {(ethBalance || usdcBalance || aTokenBalance) && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary tracking-wide">
              Balances (Base)
            </label>
            <div className="p-4 rounded-lg bg-slate-1 border border-slate-4">
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>ETH</span>
                <span className="font-mono">{ethBalance ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm text-primary mb-1">
                <span>USDC (wallet)</span>
                <span className="font-mono">{usdcBalance ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm text-primary">
                <span>aUSDC (supplied)</span>
                <span className="font-mono">{aTokenBalance ?? "—"}</span>
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
                {isLoading && step.includes("upply") ? "..." : "Supply"}
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
                {isLoading && step.includes("ithdraw") ? "..." : "Withdraw"}
              </div>
            </Button>
          </div>
          <Button
            onClick={() => handleWithdraw(true)}
            fullWidth
            disabled={isLoading}
          >
            <div className="flex items-center justify-between">
              {isLoading && step.includes("ithdraw") ? step : "Withdraw All"}
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>
        </div>

        {/* Utility Buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={fetchBalances} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              Refresh Balances
              <Image src={IconWand} alt="Wand" width={22} height={22} />
            </div>
          </Button>

          <Button onClick={handleSweep} fullWidth disabled={isLoading}>
            <div className="flex items-center justify-between">
              {isLoading && step.startsWith("S")
                ? step
                : "Sweep All + AAVE → Wallet"}
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
                    2,
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
