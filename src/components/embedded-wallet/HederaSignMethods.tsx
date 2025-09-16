import { useState } from "react";
import { MagicService } from "../../lib/get-magic";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "../SigningMethodsLayout";

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
}

export function HederaSignMethods() {
  const [message, setMessage] = useState("hello world");

  const handleGetPublicKey = async (): Promise<string> => {
    const magic = MagicService.magic as any;
    const { publicKeyDer } = await magic.hedera.getPublicKey();
    return publicKeyDer;
  };

  const handleSignMessage = async (): Promise<string> => {
    const magic = MagicService.magic as any;
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(message);
    const sigUint8Array = await magic.hedera.sign(uint8Array);

    const base64String = uint8ArrayToBase64(sigUint8Array);
    return base64String;
  };


  const tabs = [
    { 
      value: "public-key", 
      label: "Get Public Key", 
      functionName: "magic.hedera.getPublicKey()",
      payload: null,
      handler: handleGetPublicKey
    },
    { 
      value: "sign-message", 
      label: "Sign Message", 
      functionName: "magic.hedera.sign(message)",
      payload: message,
      handler: handleSignMessage
    },
  ];

  return (
    <div className="space-y-4">
      {/* Message Input for Sign Message Tab */}
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

      <SigningMethodsLayout
        title="Hedera Signing Methods"
        description="Test Hedera-specific cryptographic operations with Magic SDK"
        defaultTab="public-key"
        tabs={tabs}
      >
        <TabsContent value="public-key" />
        <TabsContent value="sign-message" />
      </SigningMethodsLayout>
    </div>
  );
}
