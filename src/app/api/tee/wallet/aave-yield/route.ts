import { express } from "@/lib/server-wallet/express";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  JsonRpcProvider,
  Transaction,
  Signature,
  Contract,
  formatUnits,
  resolveProperties,
  type TransactionRequest,
  type TransactionLike,
} from "ethers";
import { AaveClient, evmAddress } from "@aave/client";
import { supply, withdraw } from "@aave/client/actions";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const AAVE_POOL = evmAddress("0xA238Dd80C259a72e81d7e4664a9801593F98d1c5");
const USDC_DECIMALS = 6;
const BASE_CHAIN_ID = BigInt(8453);
const SWEEP_DEST = "0xbA0fd524a657359D321Edac2421325aa318A1583";

const provider = new JsonRpcProvider(
  process.env.BASE_RPC_URL || "https://mainnet.base.org"
);

const erc20 = new Contract(
  USDC_ADDRESS,
  [
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
  ],
  provider
);

const poolContract = new Contract(
  AAVE_POOL as string,
  [
    "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
    "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  ],
  provider
);

const aaveClient = AaveClient.create();

async function signAndSend(jwt: string, txRequest: TransactionRequest) {
  const resolved = await resolveProperties(txRequest);
  delete resolved.from;

  const btx = Transaction.from(resolved as TransactionLike);
  console.log("[aave] Unsigned hash:", btx.unsignedHash);

  const signResponse = await express<{ r: string; s: string; v: string }>(
    TeeEndpoint.SIGN_DATA,
    jwt,
    {
      method: "POST",
      body: JSON.stringify({
        raw_data_hash: btx.unsignedHash,
        chain: "ETH",
      }),
    }
  );

  const { r, s, v } = signResponse;
  btx.signature = Signature.from({ r, s, v });
  console.log("[aave] Broadcasting tx...");

  const txResponse = await provider.broadcastTransaction(btx.serialized);
  console.log("[aave] Tx hash:", txResponse.hash);

  const receipt = await txResponse.wait();
  console.log("[aave] Confirmed, status:", receipt?.status);
  return receipt;
}

// Execute an AAVE SDK plan via TEE signing
async function executePlan(jwt: string, eoaAddress: string, plan: any) {
  let currentNonce = await provider.getTransactionCount(eoaAddress);
  const feeData = await provider.getFeeData();

  const txBase = {
    from: eoaAddress,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    chainId: BASE_CHAIN_ID,
  };

  if (plan.__typename === "ApprovalRequired") {
    console.log("[aave] Sending approval...");
    const approveGas = await provider.estimateGas({
      from: eoaAddress,
      to: plan.approval.to,
      data: plan.approval.data,
      value: BigInt(plan.approval.value),
    });

    await signAndSend(jwt, {
      ...txBase,
      to: plan.approval.to,
      data: plan.approval.data,
      value: BigInt(plan.approval.value),
      gasLimit: approveGas * BigInt(2),
      nonce: currentNonce,
    });
    currentNonce++;

    console.log("[aave] Sending main transaction...");
    const mainGas = await provider.estimateGas({
      from: eoaAddress,
      to: plan.originalTransaction.to,
      data: plan.originalTransaction.data,
      value: BigInt(plan.originalTransaction.value),
    });

    return await signAndSend(jwt, {
      ...txBase,
      to: plan.originalTransaction.to,
      data: plan.originalTransaction.data,
      value: BigInt(plan.originalTransaction.value),
      gasLimit: mainGas * BigInt(2),
      nonce: currentNonce,
    });
  }

  if (plan.__typename === "TransactionRequest") {
    console.log("[aave] Sending transaction...");
    const gas = await provider.estimateGas({
      from: eoaAddress,
      to: plan.to,
      data: plan.data,
      value: BigInt(plan.value),
    });

    return await signAndSend(jwt, {
      ...txBase,
      to: plan.to,
      data: plan.data,
      value: BigInt(plan.value),
      gasLimit: gas * BigInt(2),
      nonce: currentNonce,
    });
  }

  if (plan.__typename === "InsufficientBalanceError") {
    throw new Error(`Insufficient balance: ${plan.required.value} required`);
  }

  throw new Error(`Unhandled plan type: ${plan.__typename}`);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.idToken) {
      return NextResponse.json(
        { error: "Authentication required", requiresReauth: true },
        { status: 401 }
      );
    }
    const jwt = session.idToken;

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    console.log("[aave] Action:", action);

    // Get wallet address
    const { public_address: eoaAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "ETH" }),
    });
    console.log("[aave] EOA:", eoaAddress);

    // Position
    if (action === "position") {
      const [usdcBal, ethBal] = await Promise.all([
        erc20.balanceOf(eoaAddress),
        provider.getBalance(eoaAddress),
      ]);

      const reserveData = await poolContract.getReserveData(USDC_ADDRESS);
      const aToken = new Contract(
        reserveData.aTokenAddress,
        ["function balanceOf(address account) view returns (uint256)"],
        provider
      );
      const aBal = await aToken.balanceOf(eoaAddress);

      const result = {
        address: eoaAddress,
        ethBalance: formatUnits(ethBal, 18),
        usdcBalance: formatUnits(usdcBal, USDC_DECIMALS),
        aTokenBalance: formatUnits(aBal, USDC_DECIMALS),
      };
      console.log("[aave] Position:", JSON.stringify(result));
      return NextResponse.json(result);
    }

    // Supply
    if (action === "supply") {
      const amount = body.amount;
      console.log("[aave] Supply:", amount, "USDC");

      const result = await supply(aaveClient, {
        market: AAVE_POOL,
        amount: {
          erc20: {
            currency: evmAddress(USDC_ADDRESS),
            value: amount,
          },
        },
        sender: evmAddress(eoaAddress),
        chainId: 8453 as const,
      } as any);

      if (result.isErr()) {
        throw new Error(`Supply failed: ${result.error}`);
      }

      const receipt = await executePlan(jwt, eoaAddress, result.value);

      return NextResponse.json({
        txHash: receipt?.hash,
        action: "supply",
        amount: `${amount} USDC`,
      });
    }

    // Withdraw
    if (action === "withdraw") {
      const amount = body.amount;
      console.log("[aave] Withdraw:", amount || "all", "USDC");

      // Get aToken balance for withdraw-all
      let withdrawAmount = amount;
      if (!withdrawAmount) {
        const reserveData = await poolContract.getReserveData(USDC_ADDRESS);
        const aToken = new Contract(
          reserveData.aTokenAddress,
          ["function balanceOf(address account) view returns (uint256)"],
          provider
        );
        const aBal = await aToken.balanceOf(eoaAddress);
        if (aBal === BigInt(0)) {
          return NextResponse.json(
            { error: "No position to withdraw" },
            { status: 400 }
          );
        }
        withdrawAmount = formatUnits(aBal, USDC_DECIMALS);
      }

      const result = await withdraw(aaveClient, {
        market: AAVE_POOL,
        amount: {
          erc20: {
            currency: evmAddress(USDC_ADDRESS),
            value: { exact: withdrawAmount },
          },
        },
        sender: evmAddress(eoaAddress),
        chainId: 8453 as const,
      } as any);

      if (result.isErr()) {
        throw new Error(`Withdraw failed: ${result.error}`);
      }

      const receipt = await executePlan(jwt, eoaAddress, result.value);

      return NextResponse.json({
        txHash: receipt?.hash,
        action: "withdraw",
        amount: withdrawAmount,
      });
    }

    // Sweep — withdraw from AAVE, send all USDC and ETH to destination
    if (action === "sweep") {
      const dest = body.destination || SWEEP_DEST;
      const results: Record<string, string> = {};
      let currentNonce = await provider.getTransactionCount(eoaAddress);
      const feeData = await provider.getFeeData();

      const txBase = {
        from: eoaAddress,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BASE_CHAIN_ID,
      };

      // Withdraw all from AAVE first
      const reserveData = await poolContract.getReserveData(USDC_ADDRESS);
      const aToken = new Contract(
        reserveData.aTokenAddress,
        ["function balanceOf(address account) view returns (uint256)"],
        provider
      );
      const aBal = await aToken.balanceOf(eoaAddress);

      if (aBal > BigInt(0)) {
        console.log("[aave] Withdrawing from AAVE...");
        const withdrawData = poolContract.interface.encodeFunctionData(
          "withdraw",
          [USDC_ADDRESS, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"), eoaAddress]
        );
        const gas = await provider.estimateGas({
          from: eoaAddress,
          to: AAVE_POOL as string,
          data: withdrawData,
        });
        const receipt = await signAndSend(jwt, {
          ...txBase,
          to: AAVE_POOL as string,
          data: withdrawData,
          nonce: currentNonce,
          gasLimit: gas * BigInt(2),
        });
        results.aaveWithdrawTx = receipt?.hash ?? "";
        currentNonce++;
      }

      // Send all USDC
      const usdcBal = await erc20.balanceOf(eoaAddress);
      if (usdcBal > BigInt(0)) {
        console.log("[aave] Sweeping USDC:", formatUnits(usdcBal, USDC_DECIMALS));
        const transferData = erc20.interface.encodeFunctionData("transfer", [
          dest,
          usdcBal,
        ]);
        const gas = await provider.estimateGas({
          from: eoaAddress,
          to: USDC_ADDRESS,
          data: transferData,
        });
        const receipt = await signAndSend(jwt, {
          ...txBase,
          to: USDC_ADDRESS,
          data: transferData,
          nonce: currentNonce,
          gasLimit: gas * BigInt(2),
        });
        results.usdcTx = receipt?.hash ?? "";
        currentNonce++;
      }

      // Send remaining ETH
      const ethBal = await provider.getBalance(eoaAddress);
      const maxFee = feeData.maxFeePerGas ?? BigInt(0);
      const ethGasLimit = BigInt(21000);
      const gasCost = ethGasLimit * maxFee * BigInt(3);
      const ethToSend = ethBal - gasCost;

      if (ethToSend > BigInt(0)) {
        console.log("[aave] Sweeping ETH:", formatUnits(ethToSend, 18));
        const receipt = await signAndSend(jwt, {
          ...txBase,
          to: dest,
          value: ethToSend,
          nonce: currentNonce,
          gasLimit: ethGasLimit,
        });
        results.ethTx = receipt?.hash ?? "";
      }

      return NextResponse.json({ action: "sweep", ...results });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[aave] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
