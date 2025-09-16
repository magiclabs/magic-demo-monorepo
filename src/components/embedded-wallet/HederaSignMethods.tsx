import { useState } from "react";
import { MagicService } from "../../lib/get-magic";
import { type HederaExtension } from "@magic-ext/hedera";
import { TabsContent } from "@radix-ui/react-tabs";
import { Button } from "../Primitives";
import { SigningMethodsLayout } from "../SigningMethodsLayout";
import { CodeBlock } from "../CodeBlock";

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
}

export function HederaSignMethods() {
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("hello world");

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

  const handleGetPublicKey = () => handleSign('public-key', async () => {
    const magic = MagicService.magic as any;
    const { publicKeyDer } = await magic.hedera.getPublicKey();
    console.log('Public key:', publicKeyDer);
    return publicKeyDer;
  });

  const handleSignMessage = () => handleSign('sign-message', async () => {
    const magic = MagicService.magic as any;
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(message);
    const sigUint8Array = await magic.hedera.sign(uint8Array);

    const base64String = uint8ArrayToBase64(sigUint8Array);
    console.log('Signature: ', base64String);
    return base64String;
  });

  const renderSignComponent = (type: string, onSign: () => void) => {
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

          {type === 'sign-message' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Message to Sign
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter message to sign"
              />
            </div>
          )}

          {signature && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Response
              </label>
              <div className="relative">
                <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30">
                  <CodeBlock code={signature} language="text" maxHeight="16rem" />
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
          {isLoading ? "Processing..." : "Execute"}
        </Button>
      </div>
    );
  };

  const tabs = [
    { value: "public-key", label: "Get Public Key", functionName: "magic.hedera.getPublicKey()" },
    { value: "sign-message", label: "Sign Message", functionName: "magic.hedera.sign(message)" },
  ];

  return (
    <SigningMethodsLayout
      title="Hedera Signing Methods"
      description="Test Hedera-specific cryptographic operations with Magic SDK"
      defaultTab="public-key"
      tabs={tabs}
    >
      <TabsContent value="public-key">
        {renderSignComponent('public-key', handleGetPublicKey)}
      </TabsContent>
      <TabsContent value="sign-message">
        {renderSignComponent('sign-message', handleSignMessage)}
      </TabsContent>
    </SigningMethodsLayout>
  );
}
