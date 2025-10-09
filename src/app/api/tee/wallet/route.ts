import { getServerSession } from "next-auth";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { express } from "@/lib/api-wallet/express";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.idToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check if there was an error refreshing the token
  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      {
        error: "Token refresh failed. Please sign in again.",
        requiresReauth: true,
      },
      { status: 401 }
    );
  }

  const body = await req.text();
  const res = await express(TeeEndpoint.WALLET, session.idToken, {
    method: "POST",
    body,
  });

  return NextResponse.json(res);
}
