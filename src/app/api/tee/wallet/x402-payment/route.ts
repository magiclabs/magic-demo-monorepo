import { express } from "@/lib/server-wallet/express";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { toAccount } from "viem/accounts";
import { hashTypedData, hashMessage, recoverAddress, createPublicClient, http, parseAbi, type Address, type Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { JsonRpcProvider, Contract, formatUnits, formatEther, Signature } from "ethers";
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

// secp256k1 curve order and half (for signature normalization)
const SECP256K1_N = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const SECP256K1_HALF_N = SECP256K1_N / 2n;

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
  // Use ethers Signature to normalize r/s/v (same as transaction signing)
  const ethSig = Signature.from({ r, s, v });
  let rHex = ethSig.r.slice(2);
  let sHex = ethSig.s.slice(2);
  let vNum = ethSig.v;

  // Normalize s to lower half of secp256k1 curve.
  // Circle's USDC (FiatTokenV2) requires low-s signatures and reverts with
  // "ECRecover: invalid signature 's' value" if s > N/2.
  const sBigInt = BigInt(ethSig.s);
  if (sBigInt > SECP256K1_HALF_N) {
    const normalizedS = SECP256K1_N - sBigInt;
    sHex = normalizedS.toString(16).padStart(64, "0");
    vNum = vNum === 27 ? 28 : 27;
    console.log("[x402] Normalized high-s signature");
  }

  const sig = `0x${rHex}${sHex}${vNum.toString(16).padStart(2, "0")}` as Hex;
  console.log("[x402] Sig length:", sig.length, "v:", vNum);
  return sig;
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
    console.log("[x402] Action:", action);

    // Get wallet address
    const { public_address: eoaAddress } = await express<{
      public_address: string;
    }>(TeeEndpoint.WALLET, jwt, {
      method: "POST",
      body: JSON.stringify({ chain: "ETH" }),
    });
    console.log("[x402] EOA:", eoaAddress);

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

      // Capture signed data for diagnostics
      let lastSignedMessage: any = null;
      let lastSignature: Hex | null = null;

      // Create TEE-backed account
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
          console.log("[x402] signTypedData called, primaryType:", primaryType);
          console.log("[x402] domain:", JSON.stringify(domain));
          const msg = message as any;
          console.log("[x402] message:", JSON.stringify({ from: msg.from, to: msg.to, value: String(msg.value) }));
          console.log("[x402] from matches EOA:", String(msg.from).toLowerCase() === eoaAddress.toLowerCase());
          const hash = hashTypedData({
            domain: domain as any,
            types: types as any,
            primaryType: primaryType as string,
            message: message as any,
          });
          console.log("[x402] EIP-712 hash:", hash);
          const sig = await signHashViaTee(jwt, hash);
          lastSignedMessage = message;
          lastSignature = sig;
          console.log("[x402] Signature:", sig.slice(0, 20) + "...");

          // Verify: recover address from signature
          try {
            const recovered = await recoverAddress({ hash, signature: sig });
            console.log("[x402] Recovered address:", recovered);
            console.log("[x402] Expected address:", eoaAddress);
            console.log("[x402] Match:", recovered.toLowerCase() === eoaAddress.toLowerCase());
          } catch (e) {
            console.log("[x402] Recovery failed:", (e as Error).message);
          }

          return sig;
        },
      });

      // Set up x402 client
      const client = new x402Client();
      client.register("eip155:*", new ExactEvmScheme(teeAccount));
      const fetchWithPayment = wrapFetchWithPayment(fetch, client);

      // First, do a plain fetch to see the 402 response headers
      console.log("[x402] Testing plain fetch to:", url);
      const testRes = await fetch(url, { method: "GET" });
      console.log("[x402] Plain fetch status:", testRes.status);
      const paymentHeader = testRes.headers.get("payment-required");
      console.log("[x402] PAYMENT-REQUIRED header:", paymentHeader ? paymentHeader.slice(0, 100) + "..." : "MISSING");

      console.log("[x402] Making paid request to:", url);
      const response = await fetchWithPayment(url, { method: "GET" });
      console.log("[x402] Paid fetch status:", response.status);

      if (!response.ok) {
        const text = await response.text();
        console.log("[x402] Response headers:", Object.fromEntries(response.headers.entries()));

        // Diagnostic: manually simulate transferWithAuthorization to get revert reason
        if (lastSignedMessage && lastSignature) {
          try {
            const viemClient = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org") });
            const msg = lastSignedMessage as any;
            const { parseSignature } = await import("viem");
            const parsedSig = parseSignature(lastSignature);
            console.log("[x402] DIAGNOSTIC: simulating transferWithAuthorization on-chain");
            console.log("[x402] args:", {
              from: msg.from, to: msg.to,
              value: String(msg.value),
              validAfter: String(msg.validAfter),
              validBefore: String(msg.validBefore),
              nonce: msg.nonce,
              v: parsedSig.v ?? parsedSig.yParity,
              r: parsedSig.r,
              s: parsedSig.s,
            });
            await viemClient.simulateContract({
              address: BASE_SEPOLIA_USDC as Address,
              abi: parseAbi([
                "function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
              ]),
              functionName: "transferWithAuthorization",
              args: [
                msg.from,
                msg.to,
                BigInt(String(msg.value)),
                BigInt(String(msg.validAfter)),
                BigInt(String(msg.validBefore)),
                msg.nonce,
                parsedSig.v ?? parsedSig.yParity ?? 27,
                parsedSig.r,
                parsedSig.s,
              ],
            });
            console.log("[x402] DIAGNOSTIC: simulation PASSED (unexpected!)");
          } catch (simErr: any) {
            console.log("[x402] DIAGNOSTIC: simulation revert:", simErr.message?.slice(0, 500));
          }
        }

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

      console.log("[x402] Making unpaid request to:", url);
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
    console.error("[x402] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
