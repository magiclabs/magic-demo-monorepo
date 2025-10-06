import { teeService } from "../../lib/tee-service";
import { parseEther } from "ethers";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import {
  PERSONAL_SIGN_PAYLOAD,
  SIGN_TYPED_DATA_V1_PAYLOAD,
  SIGN_TYPED_DATA_V3_PAYLOAD,
  SIGN_TYPED_DATA_V4_PAYLOAD,
} from "../../const/sign-typed-data-payloads";

export function EVMSignMethods({
  publicAddress,
}: {
  publicAddress: string | null;
}) {
  const signTransactionPayload = {
    from: publicAddress,
    to: publicAddress,
    value: parseEther("0.00001"),
    gasLimit: 21000,
  };

  const handlePersonalSign = async (): Promise<string> => {
    try {
      const res = await teeService.personalSign(PERSONAL_SIGN_PAYLOAD);
      const signingResponse = await res.json();
      return JSON.stringify(signingResponse, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTypedDataV1 = async (): Promise<string> => {
    try {
      const res = await teeService.signTypedDataV1(SIGN_TYPED_DATA_V1_PAYLOAD);
      const response = await res.json();
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTypedDataV3 = async (): Promise<string> => {
    try {
      const res = await teeService.signTypedDataV3(SIGN_TYPED_DATA_V3_PAYLOAD);
      const response = await res.json();
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTypedDataV4 = async (): Promise<string> => {
    try {
      const res = await teeService.signTypedDataV4(SIGN_TYPED_DATA_V4_PAYLOAD);
      const response = await res.json();
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSignTransaction = async (): Promise<string> => {
    try {
      const result = await teeService.signTransaction(signTransactionPayload);
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
      functionName: "teeService.personalSign(message)",
      payload: PERSONAL_SIGN_PAYLOAD,
      handler: handlePersonalSign,
    },
    {
      value: "typed-data-v1",
      label: "Sign Typed Data V1",
      functionName: "teeService.signTypedDataV1(data)",
      payload: SIGN_TYPED_DATA_V1_PAYLOAD,
      handler: handleSignTypedDataV1,
    },
    {
      value: "typed-data-v3",
      label: "Sign Typed Data V3",
      functionName: "teeService.signTypedDataV3(data)",
      payload: SIGN_TYPED_DATA_V3_PAYLOAD,
      handler: handleSignTypedDataV3,
    },
    {
      value: "typed-data-v4",
      label: "Sign Typed Data V4",
      functionName: "teeService.signTypedDataV4(data)",
      payload: SIGN_TYPED_DATA_V4_PAYLOAD,
      handler: handleSignTypedDataV4,
    },
    {
      value: "transaction",
      label: "Sign Transaction",
      functionName: "teeService.signTransaction(transaction)",
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
