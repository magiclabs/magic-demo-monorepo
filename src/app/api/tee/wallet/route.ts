import { teeProxy } from "@/lib/tee-proxy";
import { TeeEndpoint } from "@/types/tee-types";

export async function GET(req: Request) {
  return teeProxy(TeeEndpoint.WALLET, req, "GET");
}
export async function POST(req: Request) {
  return teeProxy(TeeEndpoint.WALLET, req, "POST");
}
