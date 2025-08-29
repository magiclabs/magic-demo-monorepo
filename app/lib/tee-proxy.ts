import { getServerSession } from "next-auth";
import { TeeEndpoint } from "./tee-types";
import { NextResponse } from "next/server";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { tee } from "./tee-client";

export async function teeProxy(
  path: TeeEndpoint,
  req: Request,
  method: "GET" | "POST"
) {
  const session = await getServerSession(authOptions);

  if (!session?.idToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = method === "POST" ? await req.text() : undefined;
  const res = await tee(path, session.idToken, {
    method,
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `TEE Error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
