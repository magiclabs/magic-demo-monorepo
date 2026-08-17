import { avalancheService } from "../../lib/server-wallet/avalanche";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import {
  PERSONAL_SIGN_PAYLOAD,
  SIGN_TYPED_DATA_V4_PAYLOAD_FUJI,
} from "../../const/sign-typed-data-payloads";

const SELF_TRANSFER_AMOUNT = "0.001";

export function AvalancheSignMethods() {
  const { publicAddress, selectedNetwork } = useServerWallet();

  if (!publicAddress || selectedNetwork !== "avalanche") {
    return null;
  }

  const { config } = avalancheService;

  const sendTransactionPayload = {
    from: publicAddress,
    to: publicAddress,
    value: `${SELF_TRANSFER_AMOUNT} ${config.nativeSymbol}`,
    chainId: config.chainId,
    network: "Avalanche Fuji C-Chain",
  };

  const handlePersonalSign = async (): Promise<string> => {
    const signingResponse = await avalancheService.personalSign(
      PERSONAL_SIGN_PAYLOAD
    );
    return JSON.stringify(signingResponse, null, 2);
  };

  const handleSignTypedDataV4 = async (): Promise<string> => {
    const response = await avalancheService.signTypedDataV4(
      SIGN_TYPED_DATA_V4_PAYLOAD_FUJI
    );
    return JSON.stringify(response, null, 2);
  };

  const handleSendTransaction = async (): Promise<string> => {
    // Self-transfer so the demo needs no second address. Requires the wallet to
    // hold test AVAX first — fund it at the Fuji faucet.
    const result = await avalancheService.sendTransaction(
      publicAddress,
      publicAddress,
      SELF_TRANSFER_AMOUNT
    );
    return JSON.stringify(result, null, 2);
  };

  const tabs = [
    {
      value: "send-transaction",
      label: "Send Transaction",
      functionName:
        "sign via /v2/wallet/sign/data → provider.broadcastTransaction() on Fuji",
      payload: sendTransactionPayload,
      handler: handleSendTransaction,
    },
    {
      value: "personal",
      label: "Personal Sign",
      functionName: "https://tee.express.magiclabs.com/v2/wallet/sign/message",
      payload: PERSONAL_SIGN_PAYLOAD,
      handler: handlePersonalSign,
    },
    {
      value: "typed-data-v4",
      label: "Sign Typed Data V4",
      functionName: "https://tee.express.magiclabs.com/v2/wallet/sign/data",
      payload: SIGN_TYPED_DATA_V4_PAYLOAD_FUJI,
      handler: handleSignTypedDataV4,
    },
  ];

  return (
    <SigningMethodsLayout
      title="Avalanche C-Chain (Fuji)"
      description={`Sign and broadcast on Avalanche Fuji testnet with Server Wallet. Same EVM key as Ethereum — fund the address with test ${config.nativeSymbol} at ${config.faucet} before sending.`}
      defaultTab="send-transaction"
      tabs={tabs}
    >
      <TabsContent value="send-transaction" />
      <TabsContent value="personal" />
      <TabsContent value="typed-data-v4" />
    </SigningMethodsLayout>
  );
}
