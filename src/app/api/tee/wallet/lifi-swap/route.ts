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
  parseUnits,
  formatUnits,
  resolveProperties,
  type TransactionRequest,
  type TransactionLike,
} from "ethers";

const LIFI_API = "https://li.quest/v1";
const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;
const BASE_CHAIN_ID = BigInt(8453);

const provider = new JsonRpcProvider(
  process.env.BASE_RPC_URL || "https://mainnet.base.org"
);

const erc20 = new Contract(
  USDC_ADDRESS,
  [
    "function approve(address spender, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
  ],
  provider
);

async function signAndSend(jwt: string, txRequest: TransactionRequest) {
  const resolved = await resolveProperties(txRequest);
  delete resolved.from;

  const btx = Transaction.from(resolved as TransactionLike);
  console.log("[lifi-swap] Unsigned hash:", btx.unsignedHash);

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
  console.log("[lifi-swap] Broadcasting tx...");

  const txResponse = await provider.broadcastTransaction(btx.serialized);
  console.log("[lifi-swap] Tx hash:", txResponse.hash);

  const receipt = await txResponse.wait();
  console.log("[lifi-swap] Confirmed, status:", receipt?.status);
  return receipt;
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
    console.log("[lifi-swap] Action:", action);

    // Get wallet address
    const { public_address: eoaAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "ETH" }),
    });
    console.log("[lifi-swap] EOA:", eoaAddress);

    // Balance
    if (action === "balance") {
      const [usdcBal, ethBal] = await Promise.all([
        erc20.balanceOf(eoaAddress),
        provider.getBalance(eoaAddress),
      ]);

      const result = {
        address: eoaAddress,
        ethBalance: formatUnits(ethBal, 18),
        usdcBalance: formatUnits(usdcBal, USDC_DECIMALS),
      };
      console.log("[lifi-swap] Balance:", JSON.stringify(result));
      return NextResponse.json(result);
    }

    // Quote
    if (action === "quote") {
      const { fromToken, toToken, fromAmount } = body;
      if (!fromToken || !toToken || !fromAmount) {
        return NextResponse.json(
          { error: "fromToken, toToken, and fromAmount are required" },
          { status: 400 }
        );
      }

      const params = new URLSearchParams({
        fromChain: "8453",
        toChain: "8453",
        fromToken,
        toToken,
        fromAmount,
        fromAddress: eoaAddress,
        slippage: "0.005",
      });

      console.log("[lifi-swap] Getting quote...");
      const res = await fetch(`${LIFI_API}/quote?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Quote failed: ${res.status}`);
      }

      const toDecimals = toToken === NATIVE_TOKEN ? 18 : USDC_DECIMALS;
      const fromDecimals = fromToken === NATIVE_TOKEN ? 18 : USDC_DECIMALS;

      return NextResponse.json({
        estimate: {
          toAmount: data.estimate.toAmount,
          toAmountFormatted: formatUnits(data.estimate.toAmount, toDecimals),
          toAmountMin: data.estimate.toAmountMin,
          approvalAddress: data.estimate.approvalAddress,
        },
        transactionRequest: data.transactionRequest,
        fromAmountFormatted: formatUnits(fromAmount, fromDecimals),
      });
    }

    // Swap
    if (action === "swap") {
      const { fromToken, toToken, fromAmount } = body;
      if (!fromToken || !toToken || !fromAmount) {
        return NextResponse.json(
          { error: "fromToken, toToken, and fromAmount are required" },
          { status: 400 }
        );
      }

      // Get fresh quote
      const params = new URLSearchParams({
        fromChain: "8453",
        toChain: "8453",
        fromToken,
        toToken,
        fromAmount,
        fromAddress: eoaAddress,
        slippage: "0.005",
      });

      console.log("[lifi-swap] Getting fresh quote for swap...");
      const quoteRes = await fetch(`${LIFI_API}/quote?${params}`);
      const quote = await quoteRes.json();
      if (!quoteRes.ok) {
        throw new Error(quote.message || `Quote failed: ${quoteRes.status}`);
      }

      let currentNonce = await provider.getTransactionCount(eoaAddress);
      const feeData = await provider.getFeeData();

      const txBase = {
        from: eoaAddress,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BASE_CHAIN_ID,
      };

      // Approve if ERC-20
      if (fromToken !== NATIVE_TOKEN && quote.estimate.approvalAddress) {
        const erc20WithSigner = new Contract(
          fromToken,
          [
            "function approve(address spender, uint256 value) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
          ],
          provider
        );

        const allowance = await erc20WithSigner.allowance(
          eoaAddress,
          quote.estimate.approvalAddress
        );

        if (allowance < BigInt(fromAmount)) {
          console.log("[lifi-swap] Approving token spend...");
          const approveData = erc20WithSigner.interface.encodeFunctionData(
            "approve",
            [quote.estimate.approvalAddress, fromAmount]
          );

          const gas = await provider.estimateGas({
            from: eoaAddress,
            to: fromToken,
            data: approveData,
          });

          await signAndSend(jwt, {
            ...txBase,
            to: fromToken,
            data: approveData,
            nonce: currentNonce,
            gasLimit: gas * BigInt(2),
          });
          currentNonce++;
        }
      }

      // Execute swap
      console.log("[lifi-swap] Executing swap...");
      const receipt = await signAndSend(jwt, {
        ...txBase,
        to: quote.transactionRequest.to,
        data: quote.transactionRequest.data,
        value: BigInt(quote.transactionRequest.value),
        gasLimit: BigInt(quote.transactionRequest.gasLimit),
        nonce: currentNonce,
      });

      const toDecimals = toToken === NATIVE_TOKEN ? 18 : USDC_DECIMALS;

      return NextResponse.json({
        txHash: receipt?.hash,
        action: "swap",
        estimatedOutput: formatUnits(quote.estimate.toAmount, toDecimals),
      });
    }

    // Sweep — send all USDC and ETH to a destination
    if (action === "sweep") {
      const dest = body.destination;
      if (!dest) {
        return NextResponse.json(
          { error: "destination is required" },
          { status: 400 }
        );
      }

      const results: Record<string, string> = {};
      let currentNonce = await provider.getTransactionCount(eoaAddress);
      const feeData = await provider.getFeeData();

      const txBase = {
        from: eoaAddress,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BASE_CHAIN_ID,
      };

      // Send all USDC
      const usdcBal = await erc20.balanceOf(eoaAddress);
      if (usdcBal > BigInt(0)) {
        console.log(
          "[lifi-swap] Sweeping USDC:",
          formatUnits(usdcBal, USDC_DECIMALS)
        );
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

      // Send remaining ETH (minus gas cost)
      const ethBal = await provider.getBalance(eoaAddress);
      const maxFee = feeData.maxFeePerGas ?? BigInt(0);
      const ethGasLimit = BigInt(21000);
      const gasCost = ethGasLimit * maxFee * BigInt(3);
      const ethToSend = ethBal - gasCost;

      if (ethToSend > BigInt(0)) {
        console.log("[lifi-swap] Sweeping ETH:", formatUnits(ethToSend, 18));
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
    console.error("[lifi-swap] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
