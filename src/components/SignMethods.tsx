import { teeService } from "../lib/tee-service";
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
  root: "glass rounded-2xl w-full max-w-4xl glow-secondary",
  trigger:
    "font-semibold px-6 py-4 text-muted-foreground hover:text-white [&[data-state=active]]:text-white [&[data-state=active]]:bg-gradient-to-r [&[data-state=active]]:from-primary/20 [&[data-state=active]]:to-secondary/20 [&[data-state=active]]:border [&[data-state=active]]:border-primary/30 cursor-pointer rounded-xl ",
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
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Signing Methods</h2>
            <p className="text-muted-foreground">
              Test various cryptographic signing operations
            </p>
          </div>
        </div>

        <TabsList className="flex flex-wrap gap-2 mb-6 bg-transparent">
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
      </div>
      <TabsContent value="personal">
        <SignComponent
          payloadDisplay={PERSONAL_SIGN_PAYLOAD}
          onSign={handlePersonalSign}
        />
      </TabsContent>
      <TabsContent value="typed-data-v1" className="">
        <SignComponent
          payloadDisplay={SIGN_TYPED_DATA_V1_PAYLOAD}
          onSign={handleSignTypedDataV1}
        />
      </TabsContent>
      <TabsContent value="typed-data-v3">
        <SignComponent
          payloadDisplay={SIGN_TYPED_DATA_V3_PAYLOAD}
          onSign={handleSignTypedDataV3}
        />
      </TabsContent>
      <TabsContent value="typed-data-v4">
        <SignComponent
          payloadDisplay={SIGN_TYPED_DATA_V4_PAYLOAD}
          onSign={handleSignTypedDataV4}
        />
      </TabsContent>
      <TabsContent value="transaction">
        <SignComponent
          payloadDisplay={signTransactionPayload}
          onSign={handleSignTransaction}
        />
      </TabsContent>
    </Tabs>
  );
}
