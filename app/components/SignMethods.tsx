import { useState } from "react";
import { teeService } from "../lib/tee-service";
import { ethers } from "ethers";
import { Button } from "./Primitives";

const SmallSignTypedDataV3Payload = {
  types: {
    EIP712Domain: [
      {
        name: "name",
        type: "string",
      },
    ],
    Order: [
      {
        name: "makerAddress",
        type: "address",
      },
    ],
  },
  domain: {
    name: "0x Protocol",
  },
  message: {
    exchangeAddress: "0x35dd2932454449b14cee11a94d3674a936d5d7b2",
  },
  primaryType: "Order",
};

const SmallSignTypedDataV4Payload = {
  domain: {
    chainId: 1,
    name: "Ether Mail",
    version: "1",
  },
  message: {
    contents: "Hello, Bob!",
  },
  primaryType: "Mail",
  types: {
    EIP712Domain: [{ name: "name", type: "string" }],
    Mail: [{ name: "contents", type: "string" }],
  },
};

export function SignMethods() {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [typedDataV1, setTypedDataV1] = useState("");
  const [typedDataV3, setTypedDataV3] = useState("");
  const [typedDataV4, setTypedDataV4] = useState("");
  const [signedTransaction, setSignedTransaction] = useState("");

  const handlePersonalSign = async () => {
    try {
      const res = await teeService.personalSign(message);
      const signingResponse = await res.json();
      setSignature(signingResponse.signature);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTypedDataV1 = async () => {
    try {
      const typedData = [
        { name: "message", type: "string", value: "Hello World" },
        { name: "from", type: "address", value: "0xabc123" },
      ];
      const res = await teeService.signTypedDataV1(typedData);
      const signingResponse = await res.json();
      setTypedDataV1(signingResponse.signature);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTypedDataV3 = async () => {
    try {
      const res = await teeService.signTypedDataV3(SmallSignTypedDataV3Payload);
      const signingResponse = await res.json();
      setTypedDataV3(signingResponse.signature);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTypedDataV4 = async () => {
    try {
      const res = await teeService.signTypedDataV4(SmallSignTypedDataV4Payload);
      const signingResponse = await res.json();
      setTypedDataV4(signingResponse.signature);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTransaction = async () => {
    try {
      const txnParams = {
        from: "0x695AC519d1346caAE5086Bb0B22443260911a885",
        to: "0x695AC519d1346caAE5086Bb0B22443260911a885",
        value: ethers.parseEther("0.00001"),
        gasLimit: 21000,
      };
      const res = await teeService.signTransaction(txnParams);
      setSignedTransaction(res);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Personal Sign</h2>
        <p className="text-sm text-gray-500">Sign a message with your wallet</p>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handlePersonalSign}>Sign</Button>
      </div>
      {signature && (
        <div className="max-w-md">
          <pre className="text-sm text-gray-500 whitespace-pre-wrap break-all">
            Signature: {signature}
          </pre>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Sign Typed Data V1</h2>
        <p className="text-sm text-gray-500">
          Sign a typed data with your wallet
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSignTypedDataV1}>Sign</Button>
      </div>
      {typedDataV1 && (
        <div className="max-w-md">
          <pre className="text-sm text-gray-500 whitespace-pre-wrap break-all">
            Signature: {typedDataV1}
          </pre>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Sign Typed Data V3</h2>
        <p className="text-sm text-gray-500">
          Sign a typed data with your wallet
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSignTypedDataV3}>Sign</Button>
      </div>
      {typedDataV3 && (
        <div className="max-w-md">
          <pre className="text-sm text-gray-500 whitespace-pre-wrap break-all">
            Signature: {typedDataV3}
          </pre>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Sign Typed Data V4</h2>
        <p className="text-sm text-gray-500">
          Sign a typed data with your wallet
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSignTypedDataV4}>Sign</Button>
        <textarea
          value={JSON.stringify(SmallSignTypedDataV4Payload, null, 2)}
          className="w-full h-40 p-2 border border-gray-300 rounded-md"
        />
      </div>
      {typedDataV4 && (
        <div className="max-w-md">
          <pre className="text-sm text-gray-500 whitespace-pre-wrap break-all">
            Signature: {typedDataV4}
          </pre>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Sign Transaction</h2>
        <p className="text-sm text-gray-500">
          Sign a transaction with your wallet
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSignTransaction}>Sign</Button>
      </div>
      {signedTransaction && (
        <div className="max-w-md">
          <pre className="text-sm text-gray-500 whitespace-pre-wrap break-all">
            Signed Transaction: {signedTransaction}
          </pre>
        </div>
      )}
    </div>
  );
}
