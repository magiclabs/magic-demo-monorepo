import { getServerSession } from "next-auth";
import { TeeEndpoint } from "@/types/tee-types";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { tee } from "@/lib/tee-client";

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
  const res = await tee(TeeEndpoint.WALLET, session.idToken, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const err = await res.text();

    // If we get a 401 from TEE service, it might be due to token expiry
    if (res.status === 401) {
      return NextResponse.json(
        {
          error: `Authentication failed: ${err}`,
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `TEE Error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
