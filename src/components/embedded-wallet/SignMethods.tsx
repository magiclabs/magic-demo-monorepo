import { useState } from "react";
import { MagicService } from "../../lib/get-magic";
import { parseEther } from "ethers";
import { TabsContent } from "@radix-ui/react-tabs";
import { Button } from "../Primitives";
import { SigningMethodsLayout } from "../SigningMethodsLayout";
import { JsonBlock } from "../CodeBlock";
import { formatPayload } from "../../utils/format";
import {
  PERSONAL_SIGN_PAYLOAD,
  SIGN_TYPED_DATA_V1_PAYLOAD,
  SIGN_TYPED_DATA_V3_PAYLOAD,
  SIGN_TYPED_DATA_V4_PAYLOAD,
} from "../../const/sign-typed-data-payloads";

export function SignMethods({
  publicAddress,
}: {
  publicAddress: string | null;
}) {
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const signTransactionPayload = {
    from: publicAddress,
    to: publicAddress,
    value: parseEther("0.00001"),
    gasLimit: 21000,
  };

  const handleSign = async (type: string, signFunction: () => Promise<string>) => {
    try {
      setLoadingStates(prev => ({ ...prev, [type]: true }));
      const signature = await signFunction();
      setSignatures(prev => ({ ...prev, [type]: signature }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const handlePersonalSign = () => handleSign('personal', async () => {
    const signer = await MagicService.provider.getSigner();
    return await signer.signMessage(PERSONAL_SIGN_PAYLOAD);
  });

  const handleSignTypedDataV1 = () => handleSign('typed-data-v1', async () => {
    const signer = await MagicService.provider.getSigner();
    // For V1, we need to structure it properly for signTypedData
    const domain = {};
    const types = {
      Message: [
        { name: "message", type: "string" },
        { name: "from", type: "address" }
      ]
    };
    const message = {
      message: "Hello World",
      from: "0xabc1234567890"
    };
    return await signer.signTypedData(domain, types, message);
  });

  const handleSignTypedDataV3 = () => handleSign('typed-data-v3', async () => {
    const signer = await MagicService.provider.getSigner();
    return await signer.signTypedData(
      SIGN_TYPED_DATA_V3_PAYLOAD.domain,
      SIGN_TYPED_DATA_V3_PAYLOAD.types,
      SIGN_TYPED_DATA_V3_PAYLOAD.message
    );
  });

  const handleSignTypedDataV4 = () => handleSign('typed-data-v4', async () => {
    const signer = await MagicService.provider.getSigner();
    return await signer.signTypedData(
      SIGN_TYPED_DATA_V4_PAYLOAD.domain,
      SIGN_TYPED_DATA_V4_PAYLOAD.types,
      SIGN_TYPED_DATA_V4_PAYLOAD.message
    );
  });

  const handleSignTransaction = () => handleSign('transaction', async () => {
    const signer = await MagicService.provider.getSigner();
    return await signer.signTransaction(signTransactionPayload);
  });

  const renderSignComponent = (type: string, payloadDisplay: string | object | [], onSign: () => void) => {
    const signature = signatures[type];
    const isLoading = loadingStates[type];


    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Function
            </label>
            <div className="p-4 rounded-lg bg-[#1e1e1e] border border-[#3e3e3e] font-mono text-sm leading-relaxed">
              {(() => {
                const tab = tabs.find(t => t.value === type);
                const functionName = tab?.functionName || 'Unknown function';
                const [funcPart, paramsPart] = functionName.split('(');
                return (
                  <>
                    <span className="text-[#9cdcfe]">{funcPart}</span>
                    <span className="text-[#ffd700]">(</span>
                    <span className="text-[#ce9178]">{paramsPart?.replace(')', '')}</span>
                    <span className="text-[#ffd700]">)</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Request Payload
            </label>
            <div className="relative">
              <JsonBlock data={formatPayload(payloadDisplay)} maxHeight="16rem" />
            </div>
          </div>

          {signature && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Signature Response
              </label>
              <div className="relative">
                <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30">
                  <JsonBlock data={signature} maxHeight="16rem" />
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button onClick={onSign} variant="secondary" disabled={isLoading}>
          <svg
            className="w-5 h-5"
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
          {isLoading ? "Signing..." : "Execute Signing"}
        </Button>
      </div>
    );
  };

  const tabs = [
    { value: "personal", label: "Personal Sign", functionName: "signer.signMessage(message)" },
    { value: "typed-data-v1", label: "Sign Typed Data V1", functionName: "signer.signTypedData(domain, types, message)" },
    { value: "typed-data-v3", label: "Sign Typed Data V3", functionName: "signer.signTypedData(domain, types, message)" },
    { value: "typed-data-v4", label: "Sign Typed Data V4", functionName: "signer.signTypedData(domain, types, message)" },
    { value: "transaction", label: "Sign Transaction", functionName: "signer.signTransaction(transaction)" },
  ];

  return (
    <SigningMethodsLayout
      title="EVM Signing Methods"
      description="Test various cryptographic signing operations with Magic SDK"
      defaultTab="personal"
      tabs={tabs}
    >
      <TabsContent value="personal">
        {renderSignComponent('personal', PERSONAL_SIGN_PAYLOAD, handlePersonalSign)}
      </TabsContent>
      <TabsContent value="typed-data-v1" className="">
        {renderSignComponent('typed-data-v1', SIGN_TYPED_DATA_V1_PAYLOAD, handleSignTypedDataV1)}
      </TabsContent>
      <TabsContent value="typed-data-v3">
        {renderSignComponent('typed-data-v3', SIGN_TYPED_DATA_V3_PAYLOAD, handleSignTypedDataV3)}
      </TabsContent>
      <TabsContent value="typed-data-v4">
        {renderSignComponent('typed-data-v4', SIGN_TYPED_DATA_V4_PAYLOAD, handleSignTypedDataV4)}
      </TabsContent>
      <TabsContent value="transaction">
        {renderSignComponent('transaction', signTransactionPayload, handleSignTransaction)}
      </TabsContent>
    </SigningMethodsLayout>
  );
}
