import { signMessage } from "./express-proxy";

const solanaSignMessage = async (data: string | Uint8Array) => {
  // Convert string to Uint8Array if needed, then encode as base64
  const messageUint8 = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const messageBase64 = Buffer.from(messageUint8).toString('base64');
  
  return await signMessage(messageBase64, "SOL");
};

const solanaSignTransaction = async (transactionMessage: Uint8Array) => {
  // Encode transaction message as base64
  const messageBase64 = Buffer.from(transactionMessage).toString('base64');
  
  return await signMessage(messageBase64, "SOL");
};

export const solanaService = {
  solanaSignMessage,
  solanaSignTransaction,
};
