import { createSmartWalletClient } from "@account-kit/wallet-client";
import { alchemy, baseSepolia } from "@account-kit/infra";
import { express } from "@/lib/server-wallet/express";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { toHex } from "viem";
import type { Address, AuthorizationRequest, Hex, SignedAuthorization } from "viem";

// POST /api/tee/wallet/smart-wallet
// Wraps the Magic TEE EOA in an Alchemy EIP-7702 smart wallet and sends 0.00001 ETH to self on Base Sepolia.
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.idToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const jwt = session.idToken;

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

    // Build a custom signer that delegates signAuthorization to Fridge
    const signer = {
      signerType: "magic-tee",
      inner: {},
      getAddress: async (): Promise<Address> => eoaAddress,
      signMessage: async (_message: unknown): Promise<Hex> => {
        throw new Error("signMessage not implemented for smart wallet flow");
      },
      signTypedData: async (_params: unknown): Promise<Hex> => {
        throw new Error("signTypedData not implemented for smart wallet flow");
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
          r: Hex;
          s: Hex;
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
          r: res.r,
          s: res.s,
          yParity: res.y_parity,
        } as SignedAuthorization<number>;
      },
    };

    const apiKey = process.env.ALCHEMY_API_KEY ?? "";
    const policyId = process.env.ALCHEMY_GAS_POLICY_ID;

    const client = createSmartWalletClient({
      transport: alchemy({ apiKey }),
      chain: baseSepolia,
      signer,
      ...(policyId ? { policyId } : {}),
    });

    // Send 0.00001 ETH to self via the EIP-7702 smart wallet
    const result = await client.sendCalls({
      from: eoaAddress,
      calls: [
        {
          to: eoaAddress,
          value: toHex(BigInt("10000000000000")), // 0.00001 ETH in wei
        },
      ],
      capabilities: {
        eip7702Auth: true,
      },
    });

    const statusResult = await client.waitForCallsStatus({ id: result.id });
    const txHash =
      statusResult.receipts?.[0]?.transactionHash ?? result.id;

    return NextResponse.json({ txHash });
  } catch (error) {
    console.error("POST smart-wallet error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
