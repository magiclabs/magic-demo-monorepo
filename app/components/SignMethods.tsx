import { useState } from "react";
import { teeService } from "../lib/tee-service";

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
        <button onClick={handlePersonalSign}>Sign</button>
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
        <button onClick={handleSignTypedDataV1}>Sign</button>
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
        <button onClick={handleSignTypedDataV3}>Sign</button>
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
        <button onClick={handleSignTypedDataV4}>Sign</button>
      </div>
      {typedDataV4 && (
        <div className="max-w-md">
          <pre className="text-sm text-gray-500 whitespace-pre-wrap break-all">
            Signature: {typedDataV4}
          </pre>
        </div>
      )}
    </div>
  );
}
