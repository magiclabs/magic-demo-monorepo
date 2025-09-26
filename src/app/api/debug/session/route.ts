import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  // Don't log sensitive tokens in production, but helpful for debugging
  const debugInfo = {
    hasIdToken: !!session.idToken,
    hasAccessToken: !!session.accessToken,
    hasError: !!session.error,
    error: session.error,
    user: session.user,
  };

  console.log("🔍 Session debug info:", debugInfo);

  return NextResponse.json(debugInfo);
}
