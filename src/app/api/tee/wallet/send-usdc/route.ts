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

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;
const BASE_CHAIN_ID = BigInt(8453);

const provider = new JsonRpcProvider(
  process.env.BASE_RPC_URL || "https://mainnet.base.org"
);

const erc20 = new Contract(
  USDC_ADDRESS,
  [
    "function transfer(address to, uint256 value) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ],
  provider
);

async function signAndSend(jwt: string, txRequest: TransactionRequest) {
  const resolved = await resolveProperties(txRequest);
  delete resolved.from;

  const btx = Transaction.from(resolved as TransactionLike);
  console.log("[send-usdc] Unsigned hash:", btx.unsignedHash);

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
  console.log("[send-usdc] Broadcasting tx...");

  const txResponse = await provider.broadcastTransaction(btx.serialized);
  console.log("[send-usdc] Tx hash:", txResponse.hash);

  const receipt = await txResponse.wait();
  console.log("[send-usdc] Confirmed, status:", receipt?.status);
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
    console.log("[send-usdc] Action:", action);

    // Get wallet address
    const { public_address: eoaAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "ETH" }),
    });
    console.log("[send-usdc] EOA:", eoaAddress);

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
      console.log("[send-usdc] Balance:", JSON.stringify(result));
      return NextResponse.json(result);
    }

    // Send
    if (action === "send") {
      const { to, amount } = body;
      if (!to || !amount) {
        return NextResponse.json(
          { error: "to and amount are required" },
          { status: 400 }
        );
      }

      const value = parseUnits(amount, USDC_DECIMALS);
      console.log("[send-usdc] Sending", amount, "USDC to", to);

      const nonce = await provider.getTransactionCount(eoaAddress);
      const feeData = await provider.getFeeData();

      const transferData = erc20.interface.encodeFunctionData("transfer", [
        to,
        value,
      ]);

      const gas = await provider.estimateGas({
        from: eoaAddress,
        to: USDC_ADDRESS,
        data: transferData,
      });
      console.log("[send-usdc] Estimated gas:", gas.toString());

      const receipt = await signAndSend(jwt, {
        from: eoaAddress,
        to: USDC_ADDRESS,
        data: transferData,
        nonce,
        gasLimit: gas * BigInt(2),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BASE_CHAIN_ID,
      });

      return NextResponse.json({
        txHash: receipt?.hash,
        action: "send",
        to,
        amount,
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
        console.log("[send-usdc] Sweeping USDC:", formatUnits(usdcBal, USDC_DECIMALS));
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
        console.log("[send-usdc] Sweeping ETH:", formatUnits(ethToSend, 18));
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
    console.error("[send-usdc] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
