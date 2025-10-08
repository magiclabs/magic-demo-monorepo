import { ethereumService } from "../../lib/api-wallet/ethereum";
import { parseEther } from "ethers";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { useApiWallet } from "@/contexts/ApiWalletContext";
import {
  PERSONAL_SIGN_PAYLOAD,
  SIGN_TYPED_DATA_V1_PAYLOAD,
  SIGN_TYPED_DATA_V3_PAYLOAD,
  SIGN_TYPED_DATA_V4_PAYLOAD,
} from "../../const/sign-typed-data-payloads";

export function EVMSignMethods() {
  const { publicAddress, selectedNetwork } = useApiWallet();
  
  if (!publicAddress || selectedNetwork !== "ethereum") {
    return null;
  }

  const signTransactionPayload = {
    from: publicAddress,
    to: publicAddress,
    value: parseEther("0.00001"),
    gasLimit: 21000,
  };

  const handlePersonalSign = async (): Promise<string> => {
    try {
      const signingResponse = await ethereumService.personalSign(PERSONAL_SIGN_PAYLOAD);
      return JSON.stringify(signingResponse, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTypedDataV1 = async (): Promise<string> => {
    try {
      const response = await ethereumService.signTypedDataV1(SIGN_TYPED_DATA_V1_PAYLOAD);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTypedDataV3 = async (): Promise<string> => {
    try {
      const response = await ethereumService.signTypedDataV3(SIGN_TYPED_DATA_V3_PAYLOAD);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTypedDataV4 = async (): Promise<string> => {
    try {
      const response = await ethereumService.signTypedDataV4(SIGN_TYPED_DATA_V4_PAYLOAD);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTransaction = async (): Promise<string> => {
    try {
      const result = await ethereumService.signTransaction(signTransactionPayload);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const tabs = [
    {
      value: "personal",
      label: "Personal Sign",
      functionName: "https://tee.express.magiclabs.com/v1/sign/message",
      payload: PERSONAL_SIGN_PAYLOAD,
      handler: handlePersonalSign,
    },
    {
      value: "typed-data-v1",
      label: "Sign Typed Data V1",
      functionName: "https://tee.express.magiclabs.com/v1/sign/data",
      payload: SIGN_TYPED_DATA_V1_PAYLOAD,
      handler: handleSignTypedDataV1,
    },
    {
      value: "typed-data-v3",
      label: "Sign Typed Data V3",
      functionName: "https://tee.express.magiclabs.com/v1/sign/data",
      payload: SIGN_TYPED_DATA_V3_PAYLOAD,
      handler: handleSignTypedDataV3,
    },
    {
      value: "typed-data-v4",
      label: "Sign Typed Data V4",
      functionName: "https://tee.express.magiclabs.com/v1/sign/data",
      payload: SIGN_TYPED_DATA_V4_PAYLOAD,
      handler: handleSignTypedDataV4,
    },
    {
      value: "transaction",
      label: "Sign Transaction",
      functionName: "https://tee.express.magiclabs.com/v1/sign/data",
      payload: signTransactionPayload,
      handler: handleSignTransaction,
    },
  ];

  return (
    <SigningMethodsLayout
      title="EVM Signing Methods"
      description="Test various EVM cryptographic signing operations with TEE API"
      defaultTab="personal"
      tabs={tabs}
    >
      <TabsContent value="personal" />
      <TabsContent value="typed-data-v1" />
      <TabsContent value="typed-data-v3" />
      <TabsContent value="typed-data-v4" />
      <TabsContent value="transaction" />
    </SigningMethodsLayout>
  );
}
