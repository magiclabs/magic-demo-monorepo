import { tee } from "../tee-client";
import { TeeEndpoint } from "../../types/tee-types";

const solanaSignMessage = async (data: string | Uint8Array, jwt: string) => {
  // Convert string to Uint8Array if needed, then encode as base64
  const messageUint8 = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const message = Buffer.from(messageUint8).toString('base64');
  
  const body = { message_base64: message };
  return await tee(TeeEndpoint.SIGN_MESSAGE, jwt, {
    method: "POST",
    headers: { 
      "X-Magic-Chain": "SOL"
    },
    body: JSON.stringify(body),
  });
};

const solanaSignTransaction = async (transactionMessage: Uint8Array, jwt: string) => {
  // Encode transaction message as base64
  const message = Buffer.from(transactionMessage).toString('base64');
  
  const body = { message_base64: message };
  return await tee(TeeEndpoint.SIGN_MESSAGE, jwt, {
    method: "POST",
    headers: { 
      "X-Magic-Chain": "SOL"
    },
    body: JSON.stringify(body),
  });
};

export const solanaService = {
  solanaSignMessage,
  solanaSignTransaction,
};
