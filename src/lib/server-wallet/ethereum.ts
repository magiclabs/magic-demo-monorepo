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
import { signData, signMessage } from "./express-proxy";

const computeEip712Hash = (
  data: TypedMessage<MessageTypes>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
): string => {
  const hashBuffer = TypedDataUtils.eip712Hash(data, version);
  return "0x" + hashBuffer.toString("hex");
};

const personalSign = async (data: string) => {
  const messageBase64 = Buffer.from(data, "utf-8").toString("base64");
  return await signMessage(messageBase64, "ETH");
};

const signTypedDataV1 = async (data: TypedDataV1) => {
  const rawDataHash = typedSignatureHash(data);
  return await signData(rawDataHash, "ETH");
};

const signTypedDataV3 = async (data: TypedMessage<MessageTypes>) => {
  const rawDataHash = computeEip712Hash(data, SignTypedDataVersion.V3);
  return await signData(rawDataHash, "ETH");
};

const signTypedDataV4 = async (data: TypedMessage<MessageTypes>) => {
  const rawDataHash = computeEip712Hash(data, SignTypedDataVersion.V4);
  return await signData(rawDataHash, "ETH");
};

const signTransaction = async (tx: TransactionRequest) => {
  const resolvedTx = await resolveProperties(tx);
  const txForSigning = { ...resolvedTx };
  delete txForSigning.from;

  const btx = Transaction.from(txForSigning as TransactionLike);

  const { r, s, v } = await signData(btx.unsignedHash, "ETH");
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
