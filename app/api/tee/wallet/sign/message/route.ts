import { tee } from "@/app/lib/tee-client";
import { TeeEndpoint } from "@/app/types/tee-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/tee/wallet/sign/message → forwards to POST /v1/wallet/sign/message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.idToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.text();
    const res = await tee(TeeEndpoint.SIGN_MESSAGE, session.idToken, {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `TEE API Error: ${res.status} - ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST sign message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
