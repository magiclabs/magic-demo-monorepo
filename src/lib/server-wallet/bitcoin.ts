import { signData } from "./express-proxy";
import { createHash } from "crypto";

// Sign a raw data hash (ECDSA signature)
const btcSignData = async (data: string): Promise<{ r: string; s: string; v: number }> => {
  // Hash the data using SHA-256 (Bitcoin's standard)
  const hash = createHash("sha256").update(data).digest("hex");
  const rawDataHash = "0x" + hash;
  
  return await signData(rawDataHash, "BTC");
};

export const bitcoinService = {
  btcSignData,
};