import { teeService } from "../types/tee-service";
import { parseEther } from "ethers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { SignComponent } from "./SignComponent";
import {
  PERSONAL_SIGN_PAYLOAD,
  SIGN_TYPED_DATA_V1_PAYLOAD,
  SIGN_TYPED_DATA_V3_PAYLOAD,
  SIGN_TYPED_DATA_V4_PAYLOAD,
} from "../const/sign-typed-data-payloads";

const TabsClasses = {
  root: "bg-[rgb(36,36,38)] rounded-lg w-[723px]",
  trigger:
    "font-semibold px-4 pt-3 pb-2 text-white [&[data-state=active]]:border-b-2 [&[data-state=active]]:border-b-white cursor-pointer",
};

export function SignMethods({
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

  const handlePersonalSign = async () => {
    try {
      const res = await teeService.personalSign(PERSONAL_SIGN_PAYLOAD);
      const signingResponse = await res.json();
      return signingResponse;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTypedDataV1 = async () => {
    try {
      const res = await teeService.signTypedDataV1(SIGN_TYPED_DATA_V1_PAYLOAD);
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTypedDataV3 = async () => {
    try {
      const res = await teeService.signTypedDataV3(SIGN_TYPED_DATA_V3_PAYLOAD);
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTypedDataV4 = async () => {
    try {
      const res = await teeService.signTypedDataV4(SIGN_TYPED_DATA_V4_PAYLOAD);
      return await res.json();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignTransaction = async () => {
    try {
      return await teeService.signTransaction(signTransactionPayload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <Tabs defaultValue="personal" className={TabsClasses.root}>
      <TabsList>
        <TabsTrigger className={TabsClasses.trigger} value="personal">
          Personal Sign
        </TabsTrigger>
        <TabsTrigger className={TabsClasses.trigger} value="typed-data-v1">
          Typed Data V1
        </TabsTrigger>
        <TabsTrigger className={TabsClasses.trigger} value="typed-data-v3">
          Typed Data V3
        </TabsTrigger>
        <TabsTrigger className={TabsClasses.trigger} value="typed-data-v4">
          Typed Data V4
        </TabsTrigger>
        <TabsTrigger className={TabsClasses.trigger} value="transaction">
          Sign Transaction
        </TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <SignComponent
          title="Personal Sign"
          payloadDisplay={PERSONAL_SIGN_PAYLOAD}
          onSign={handlePersonalSign}
        />
      </TabsContent>
      <TabsContent value="typed-data-v1" className="">
        <SignComponent
          title="Typed Data V1"
          payloadDisplay={SIGN_TYPED_DATA_V1_PAYLOAD}
          onSign={handleSignTypedDataV1}
        />
      </TabsContent>
      <TabsContent value="typed-data-v3">
        <SignComponent
          title="Typed Data V3"
          payloadDisplay={SIGN_TYPED_DATA_V3_PAYLOAD}
          onSign={handleSignTypedDataV3}
        />
      </TabsContent>
      <TabsContent value="typed-data-v4">
        <SignComponent
          title="Typed Data V4"
          payloadDisplay={SIGN_TYPED_DATA_V4_PAYLOAD}
          onSign={handleSignTypedDataV4}
        />
      </TabsContent>
      <TabsContent value="transaction">
        <SignComponent
          title="Sign Transaction"
          payloadDisplay={signTransactionPayload}
          onSign={handleSignTransaction}
        />
      </TabsContent>
    </Tabs>
  );
}
