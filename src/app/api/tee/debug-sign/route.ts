import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const TEE_BASE = "https://tee.express.magiclabs.com";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.idToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const jwt = session.idToken;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
    "X-Magic-Secret-Key": process.env.SERVER_WALLET_SECRET_KEY ?? "",
    "X-OIDC-Provider-ID": process.env.NEXT_PUBLIC_OIDC_PROVIDER_ID ?? "",
    "X-Magic-Chain": "ETH",
  };

  // Test 1: sign/message (works)
  const messageRes = await fetch(`${TEE_BASE}/v1/wallet/sign/message`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message_base64: "SGVsbG8=", chain: "ETH" }),
  });
  const messageStatus = messageRes.status;
  const messageBody = await messageRes.text();

  // Test 2: sign/data (fails)
  const dataRes = await fetch(`${TEE_BASE}/v1/wallet/sign/data`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      raw_data_hash: "0xf7cfb87a6eced3fc18ea36707ee74f659e628f07ef97529b46b3bd261c1d8b71",
      chain: "ETH",
    }),
  });
  const dataStatus = dataRes.status;
  const dataBody = await dataRes.text();

  // Test 3: sign/data WITHOUT chain in body
  const dataNoChainRes = await fetch(`${TEE_BASE}/v1/wallet/sign/data`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      raw_data_hash: "0xf7cfb87a6eced3fc18ea36707ee74f659e628f07ef97529b46b3bd261c1d8b71",
    }),
  });
  const dataNoChainStatus = dataNoChainRes.status;
  const dataNoChainBody = await dataNoChainRes.text();

  // Test 4: sign/data with X-Magic-Referrer
  const dataRefRes = await fetch(`${TEE_BASE}/v1/wallet/sign/data`, {
    method: "POST",
    headers: { ...headers, "X-Magic-Referrer": "https://demo.magic.link" },
    body: JSON.stringify({
      raw_data_hash: "0xf7cfb87a6eced3fc18ea36707ee74f659e628f07ef97529b46b3bd261c1d8b71",
      chain: "ETH",
    }),
  });
  const dataRefStatus = dataRefRes.status;
  const dataRefBody = await dataRefRes.text();

  return NextResponse.json({
    signMessage: { status: messageStatus, body: messageBody },
    signData: { status: dataStatus, body: dataBody },
    signDataNoChain: { status: dataNoChainStatus, body: dataNoChainBody },
    signDataWithReferrer: { status: dataRefStatus, body: dataRefBody },
  });
}
