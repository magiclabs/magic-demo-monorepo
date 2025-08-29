import { teeProxy } from "@/app/lib/tee-proxy";
import { TeeEndpoint } from "@/app/lib/tee-types";

export async function GET(req: Request) {
  return teeProxy(TeeEndpoint.WALLET, req, "GET");
}
export async function POST(req: Request) {
  return teeProxy(TeeEndpoint.WALLET, req, "POST");
}
