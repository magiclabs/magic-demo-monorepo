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

const computeEip712Hash = (
  data: TypedMessage<MessageTypes>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4
): string => {
  const hashBuffer = TypedDataUtils.eip712Hash(data, version);
  return "0x" + hashBuffer.toString("hex");
};

const getOrCreateWallet = async () => {
  const res = await fetch("/api/tee/wallet", {
    method: "POST",
  });
  const data = await res.json();
  return data.public_address;
};

const personalSign = async (data: string) => {
  const message = Buffer.from(data, "utf-8").toString("base64");
  const body = { message_base64: message };
  return await fetch("/api/tee/wallet/sign/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const signTypedDataV1 = async (data: TypedDataV1) => {
  const rawDataHash = typedSignatureHash(data);
  const body = { raw_data_hash: rawDataHash };
  return await fetch("/api/tee/wallet/sign/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const signTypedDataV3 = async (data: TypedMessage<MessageTypes>) => {
  const rawDataHash = computeEip712Hash(data, SignTypedDataVersion.V3);
  const body = { raw_data_hash: rawDataHash };
  return await fetch("/api/tee/wallet/sign/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const signTypedDataV4 = async (data: TypedMessage<MessageTypes>) => {
  const rawDataHash = computeEip712Hash(data, SignTypedDataVersion.V4);
  const body = { raw_data_hash: rawDataHash };
  return await fetch("/api/tee/wallet/sign/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const signTransaction = async (tx: TransactionRequest) => {
  const resolvedTx = await resolveProperties(tx);
  const txForSigning = { ...resolvedTx };
  delete txForSigning.from;

  const btx = Transaction.from(txForSigning as TransactionLike);

  const body = { raw_data_hash: btx.unsignedHash };
  const res = await fetch("/api/tee/wallet/sign/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const { r, s, v } = await res.json();
  btx.signature = Signature.from({ r, s, v });
  return btx.serialized;
};

export const teeService = {
  getOrCreateWallet,
  personalSign,
  signTypedDataV1,
  signTypedDataV3,
  signTypedDataV4,
  signTransaction,
};
