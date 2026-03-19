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
const VAULT_ADDRESS = "0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61";
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
  ],
  provider
);

const vault = new Contract(
  VAULT_ADDRESS,
  [
    "function deposit(uint256 assets, address receiver) returns (uint256)",
    "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function convertToAssets(uint256 shares) view returns (uint256)",
    "function previewDeposit(uint256 assets) view returns (uint256)",
  ],
  provider
);

async function signAndSend(jwt: string, txRequest: TransactionRequest) {
  const resolved = await resolveProperties(txRequest);
  delete resolved.from;

  const btx = Transaction.from(resolved as TransactionLike);
  console.log("[morpho] Unsigned hash:", btx.unsignedHash);

  console.log("[morpho] Signing hash via TEE:", btx.unsignedHash);
  console.log("[morpho] JWT length:", jwt.length, "JWT prefix:", jwt.substring(0, 20) + "...");

  let signResponse: { r: string; s: string; v: string };
  try {
    signResponse = await express<{ r: string; s: string; v: string }>(
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
  } catch (err) {
    console.error("[morpho] TEE sign/data failed:", err);
    throw err;
  }

  const { r, s, v } = signResponse;

  btx.signature = Signature.from({ r, s, v });
  console.log("[morpho] Broadcasting tx...");

  const txResponse = await provider.broadcastTransaction(btx.serialized);
  console.log("[morpho] Tx hash:", txResponse.hash);

  const receipt = await txResponse.wait();
  console.log("[morpho] Confirmed, status:", receipt?.status);
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
    console.log("[morpho] Action:", action);

    // Get wallet address
    const { public_address: eoaAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "ETH" }),
    });
    console.log("[morpho] EOA:", eoaAddress);

    // Position
    if (action === "position") {
      const [usdcBal, shares, ethBal] = await Promise.all([
        erc20.balanceOf(eoaAddress),
        vault.balanceOf(eoaAddress),
        provider.getBalance(eoaAddress),
      ]);

      let vaultValue = "0";
      if (shares > BigInt(0)) {
        const assets = await vault.convertToAssets(shares);
        vaultValue = formatUnits(assets, USDC_DECIMALS);
      }

      const result = {
        address: eoaAddress,
        ethBalance: formatUnits(ethBal, 18),
        usdcBalance: formatUnits(usdcBal, USDC_DECIMALS),
        vaultShares: shares.toString(),
        vaultValue,
      };
      console.log("[morpho] Position:", JSON.stringify(result));
      return NextResponse.json(result);
    }

    // Deposit
    if (action === "deposit") {
      const amount = parseUnits(body.amount, USDC_DECIMALS);
      console.log("[morpho] Deposit:", body.amount, "USDC");

      const nonce = await provider.getTransactionCount(eoaAddress);
      const feeData = await provider.getFeeData();

      const txBase = {
        from: eoaAddress,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BASE_CHAIN_ID,
      };

      // Approve if needed
      const allowance = await erc20.allowance(eoaAddress, VAULT_ADDRESS);
      console.log("[morpho] Allowance:", allowance.toString());
      let currentNonce = nonce;

      if (allowance < amount) {
        console.log("[morpho] Approving USDC...");
        await signAndSend(jwt, {
          ...txBase,
          to: USDC_ADDRESS,
          data: erc20.interface.encodeFunctionData("approve", [
            VAULT_ADDRESS,
            amount,
          ]),
          nonce: currentNonce,
          gasLimit: BigInt(60000),
        });
        currentNonce++;
      }

      console.log("[morpho] Depositing...");
      const receipt = await signAndSend(jwt, {
        ...txBase,
        to: VAULT_ADDRESS,
        data: vault.interface.encodeFunctionData("deposit", [
          amount,
          eoaAddress,
        ]),
        nonce: currentNonce,
        gasLimit: BigInt(300000),
      });

      return NextResponse.json({
        txHash: receipt?.hash,
        action: "deposit",
        amount: body.amount,
      });
    }

    // Withdraw
    if (action === "withdraw") {
      const shares = await vault.balanceOf(eoaAddress);
      console.log("[morpho] Shares:", shares.toString());

      if (shares === BigInt(0)) {
        return NextResponse.json(
          { error: "No position to withdraw" },
          { status: 400 }
        );
      }

      const nonce = await provider.getTransactionCount(eoaAddress);
      const feeData = await provider.getFeeData();

      console.log("[morpho] Redeeming...");
      const receipt = await signAndSend(jwt, {
        to: VAULT_ADDRESS,
        from: eoaAddress,
        data: vault.interface.encodeFunctionData("redeem", [
          shares,
          eoaAddress,
          eoaAddress,
        ]),
        nonce,
        gasLimit: BigInt(300000),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BASE_CHAIN_ID,
      });

      return NextResponse.json({
        txHash: receipt?.hash,
        action: "withdraw",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[morpho] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
