import {
  MessageTypes,
  SignTypedDataVersion,
  TypedDataUtils,
  TypedDataV1,
  TypedMessage,
  typedSignatureHash,
} from "@metamask/eth-sig-util";
import {
  resolveProperties,
  Signature,
  Transaction,
  TransactionLike,
  TransactionRequest,
} from "ethers";
import { tee } from "../tee-client";
import { TeeEndpoint } from "../../types/tee-types";

const computeEip712Hash = (
  data: TypedMessage<MessageTypes>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
): string => {
  const hashBuffer = TypedDataUtils.eip712Hash(data, version);
  return "0x" + hashBuffer.toString("hex");
};

const personalSign = async (data: string, jwt: string) => {
  const message = Buffer.from(data, "utf-8").toString("base64");
  const body = { message_base64: message };
  return await tee(TeeEndpoint.SIGN_MESSAGE, jwt, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const signTypedDataV1 = async (data: TypedDataV1, jwt: string) => {
  const rawDataHash = typedSignatureHash(data);
  const body = { raw_data_hash: rawDataHash };
  return await tee(TeeEndpoint.SIGN_DATA, jwt, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const signTypedDataV3 = async (data: TypedMessage<MessageTypes>, jwt: string) => {
  const rawDataHash = computeEip712Hash(data, SignTypedDataVersion.V3);
  const body = { raw_data_hash: rawDataHash };
  return await tee(TeeEndpoint.SIGN_DATA, jwt, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const signTypedDataV4 = async (data: TypedMessage<MessageTypes>, jwt: string) => {
  const rawDataHash = computeEip712Hash(data, SignTypedDataVersion.V4);
  const body = { raw_data_hash: rawDataHash };
  return await tee(TeeEndpoint.SIGN_DATA, jwt, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

const signTransaction = async (tx: TransactionRequest, jwt: string) => {
  const resolvedTx = await resolveProperties(tx);
  const txForSigning = { ...resolvedTx };
  delete txForSigning.from;

  const btx = Transaction.from(txForSigning as TransactionLike);

  const body = { raw_data_hash: btx.unsignedHash };
  const res = await tee(TeeEndpoint.SIGN_DATA, jwt, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const { r, s, v } = await res.json();
  btx.signature = Signature.from({ r, s, v });
  return btx.serialized;
};

export const ethereumService = {
  personalSign,
  signTypedDataV1,
  signTypedDataV3,
  signTypedDataV4,
  signTransaction,
};
