import { createSmartWalletClient } from "@account-kit/wallet-client";
import type { SmartAccountSigner } from "@aa-sdk/core";
import { alchemy, baseSepolia } from "@account-kit/infra";
import { express } from "@/lib/server-wallet/express";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hashMessage, hashTypedData, serializeSignature } from "viem";
import type {
  Address,
  AuthorizationRequest,
  Hex,
  SignableMessage,
  SignedAuthorization,
  TypedDataDefinition,
} from "viem";

// POST /api/tee/wallet/smart-wallet
// Wraps the Magic TEE EOA in an Alchemy EIP-7702 smart wallet and sends
// gas-sponsored transactions on Base Sepolia to demonstrate delegation.
// Accepts { mode: "single" | "batch" } in the request body.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.idToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const jwt = session.idToken;
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "batch" ? "batch" : "single";

    // Fetch EOA address from Fridge
    const walletRes = await express<{ public_address: string }>(
      TeeEndpoint.WALLET,
      jwt,
      {
        method: "POST",
        body: JSON.stringify({ chain: "ETH" }),
      }
    );
    const eoaAddress = walletRes.public_address as Address;

    // Fridge returns r/s as decimal strings; convert to 0x-prefixed 32-byte hex
    const decToHex = (dec: string): Hex =>
      `0x${BigInt(dec).toString(16).padStart(64, "0")}` as Hex;

    // Sign a raw hash via Fridge sign/data and return a serialized signature
    const signRawHash = async (hash: Hex): Promise<Hex> => {
      const res = await express<{ r: string; s: string; v: number }>(
        TeeEndpoint.SIGN_DATA,
        jwt,
        {
          method: "POST",
          body: JSON.stringify({ raw_data_hash: hash, chain: "ETH" }),
        }
      );
      // Normalize v: Fridge may return 0/1 (recovery id) or 27/28 (legacy v)
      const vNum = Number(res.v);
      const yParity = vNum >= 27 ? vNum - 27 : vNum;
      return serializeSignature({
        r: decToHex(res.r),
        s: decToHex(res.s),
        yParity,
      });
    };

    // Build a custom signer that delegates signing to Fridge
    const signer = {
      signerType: "magic-tee",
      inner: {},
      getAddress: async (): Promise<Address> => eoaAddress,
      signMessage: async (message: SignableMessage): Promise<Hex> => {
        // Compute the EIP-191 personal message hash ourselves, then sign the
        // raw hash via Fridge sign/data. This avoids ambiguity about whether
        // Fridge's sign/message adds the prefix correctly for raw byte inputs.
        return signRawHash(hashMessage(message));
      },
      signTypedData: async (params: TypedDataDefinition): Promise<Hex> => {
        return signRawHash(hashTypedData(params));
      },
      signAuthorization: async (
        unsignedAuth: AuthorizationRequest<number>
      ): Promise<SignedAuthorization<number>> => {
        // AuthorizationRequest uses either `address` or `contractAddress`
        const delegationAddress =
          (unsignedAuth as { address?: Address }).address ??
          (unsignedAuth as { contractAddress?: Address }).contractAddress ??
          ("0x" as Address);

        const res = await express<{
          r: string;
          s: string;
          v: number;
          y_parity: number;
        }>(TeeEndpoint.SIGN_EIP7702, jwt, {
          method: "POST",
          body: JSON.stringify({
            chain_id: unsignedAuth.chainId,
            address: delegationAddress,
            nonce: unsignedAuth.nonce,
            chain: "ETH",
          }),
        });

        return {
          address: delegationAddress,
          chainId: unsignedAuth.chainId,
          nonce: unsignedAuth.nonce,
          r: decToHex(res.r),
          s: decToHex(res.s),
          yParity: res.y_parity,
        } as SignedAuthorization<number>;
      },
    };

    const apiKey = process.env.ALCHEMY_API_KEY ?? "";
    const policyId = process.env.ALCHEMY_GAS_POLICY_ID;

    const client = createSmartWalletClient({
      transport: alchemy({ apiKey }),
      chain: baseSepolia,
      signer: signer as unknown as SmartAccountSigner,
      ...(policyId ? { policyId } : {}),
    });

    // Cannot send to eoaAddress itself — once delegated to ModularAccountV2,
    // a plain ETH transfer to self triggers UnrecognizedFunction(bytes4(0)).
    const BURN = "0x000000000000000000000000000000000000dEaD" as Address;
    const ZERO = "0x0000000000000000000000000000000000000000" as Address;

    const calls =
      mode === "batch"
        ? [
            { to: BURN, value: "0x0" as Hex, data: "0x" as Hex },
            { to: ZERO, value: "0x0" as Hex, data: "0x" as Hex },
          ]
        : [{ to: BURN, value: "0x0" as Hex, data: "0x" as Hex }];

    const result = await client.sendCalls({
      from: eoaAddress,
      calls,
      capabilities: {
        eip7702Auth: true,
      },
    });

    const statusResult = await client.waitForCallsStatus({ id: result.id });
    const txHash =
      statusResult.receipts?.[0]?.transactionHash ?? result.id;

    return NextResponse.json({
      txHash,
      mode,
      callCount: calls.length,
      chain: "Base Sepolia",
      sponsored: true,
    });
  } catch (error) {
    console.error("POST smart-wallet error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
