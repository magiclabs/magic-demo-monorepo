import { express } from "@/lib/server-wallet/express";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { toAccount } from "viem/accounts";
import { hashTypedData, hashMessage, serializeSignature, type Address, type Hex } from "viem";
import { JsonRpcProvider, Contract, formatUnits, formatEther } from "ethers";
import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";

const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_DECIMALS = 6;
const sepoliaProvider = new JsonRpcProvider("https://sepolia.base.org");
const sepoliaUsdc = new Contract(
  BASE_SEPOLIA_USDC,
  ["function balanceOf(address account) view returns (uint256)"],
  sepoliaProvider
);

async function signHashViaTee(jwt: string, hash: Hex): Promise<Hex> {
  const { r, s, v } = await express<{ r: string; s: string; v: string }>(
    TeeEndpoint.SIGN_DATA,
    jwt,
    {
      method: "POST",
      body: JSON.stringify({
        raw_data_hash: hash,
        chain: "ETH",
      }),
    }
  );
  return serializeSignature({ r: r as Hex, s: s as Hex, yParity: Number(v) - 27 });
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
    const { action, url } = body;

    // Get wallet address
    const { public_address: eoaAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "ETH" }),
    });

    if (action === "info") {
      return NextResponse.json({ address: eoaAddress });
    }

    if (action === "balance") {
      const [usdcBal, ethBal] = await Promise.all([
        sepoliaUsdc.balanceOf(eoaAddress),
        sepoliaProvider.getBalance(eoaAddress),
      ]);
      return NextResponse.json({
        address: eoaAddress,
        ethBalance: formatEther(ethBal),
        usdcBalance: formatUnits(usdcBal, USDC_DECIMALS),
      });
    }

    if (action === "pay") {
      if (!url) {
        return NextResponse.json(
          { error: "url is required" },
          { status: 400 }
        );
      }

      // Create TEE-backed account for x402 signing
      const teeAccount = toAccount({
        address: eoaAddress as Address,
        signMessage: async ({ message }) => {
          const hash =
            typeof message === "string"
              ? hashMessage(message)
              : hashMessage({ raw: message as unknown as Hex });
          return signHashViaTee(jwt, hash);
        },
        signTransaction: async () => {
          throw new Error("Use signAndSend for transactions");
        },
        signTypedData: async ({ domain, types, primaryType, message }) => {
          const hash = hashTypedData({
            domain: domain as any,
            types: types as any,
            primaryType: primaryType as string,
            message: message as any,
          });
          return signHashViaTee(jwt, hash);
        },
      });

      // Set up x402 client
      const client = new x402Client();
      client.register("eip155:*", new ExactEvmScheme(teeAccount));

      const fetchWithPayment = wrapFetchWithPayment(fetch, client);
      const response = await fetchWithPayment(url, { method: "GET" });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed (${response.status}): ${text}`);
      }

      const data = await response.json();
      return NextResponse.json({
        status: response.status,
        data,
        paidFrom: eoaAddress,
      });
    }

    if (action === "free") {
      if (!url) {
        return NextResponse.json(
          { error: "url is required" },
          { status: 400 }
        );
      }

      const response = await fetch(url, { method: "GET" });
      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("json")
        ? await response.json()
        : await response.text();

      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        body,
        note:
          response.status === 402
            ? "Server requires payment! Use 'Pay & Fetch' to pay with x402."
            : undefined,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
