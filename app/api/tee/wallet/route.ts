import { teeFetch } from "@/app/lib/tee-client";
import { TeeEndpoint } from "@/app/lib/tee-types";
import { NextResponse } from "next/server";

// GET /api/tee/wallet → forwards to GET /v1/wallet
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json(
      { error: "Missing Authorization" },
      { status: 401 }
    );

  const res = await teeFetch(TeeEndpoint.WALLET, {
    headers: { Authorization: auth },
  });
  const data = await res.json().catch(() => ({}));

  return NextResponse.json(data, { status: res.status });
}

// POST /api/tee/wallet → forwards to POST /v1/wallet
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json(
      { error: "Missing Authorization" },
      { status: 401 }
    );

  const body = await req.text(); // forward raw body (or req.json() if you want to validate)
  const res = await teeFetch(TeeEndpoint.WALLET, {
    method: "POST",
    headers: { Authorization: auth },
    body,
  });
  const data = await res.json().catch(() => ({}));

  return NextResponse.json(data, { status: res.status });
}
