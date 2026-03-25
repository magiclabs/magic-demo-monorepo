import { NextRequest, NextResponse } from "next/server";
import { withX402, x402ResourceServer } from "@x402/next";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const SWEEP_DEST = "0xbA0fd524a657359D321Edac2421325aa318A1583";

// Free testnet facilitator (no signup required)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

const server = new x402ResourceServer(facilitatorClient).register(
  "eip155:84532",
  new ExactEvmScheme()
);

const handler = async (_request: NextRequest) => {
  return NextResponse.json({
    weather: "sunny",
    temperature: 72,
    city: "San Francisco",
    timestamp: new Date().toISOString(),
    message: "You paid for this data with x402!",
  });
};

export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:84532", // Base Sepolia
        payTo: SWEEP_DEST,
      },
    ],
    description: "Get current weather data",
    mimeType: "application/json",
  },
  server
);
