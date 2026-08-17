export const PERSONAL_SIGN_PAYLOAD = "Hello World";

export const SIGN_TYPED_DATA_V1_PAYLOAD = [
  { name: "message", type: "string", value: "Hello World" },
  {
    name: "from",
    type: "address",
    value: "0xabc1234567890",
  },
];

export const SIGN_TYPED_DATA_V3_PAYLOAD = {
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

export const SIGN_TYPED_DATA_V4_PAYLOAD = {
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

// Avalanche Fuji (chainId 43113) variant, so the EIP-712 domain matches the chain
// the Server Wallet demo is signing for.
export const SIGN_TYPED_DATA_V4_PAYLOAD_FUJI = {
  domain: {
    chainId: 43113,
    name: "Ether Mail",
    version: "1",
  },
  message: {
    contents: "Hello from Avalanche Fuji!",
  },
  primaryType: "Mail",
  types: {
    EIP712Domain: [{ name: "name", type: "string" }],
    Mail: [{ name: "contents", type: "string" }],
  },
};
