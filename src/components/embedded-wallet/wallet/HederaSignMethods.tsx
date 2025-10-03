import { MagicService } from "@/lib/get-magic";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
}

const HEDERA_SIGN_MESSAGE = "hello world";

export function HederaSignMethods() {

  const handleGetPublicKey = async (): Promise<string> => {
    const magic = MagicService.magic as any;
    const { publicKeyDer } = await magic.hedera.getPublicAddress();
    return publicKeyDer;
  };

  const handleSignMessage = async (): Promise<string> => {
    const magic = MagicService.magic as any;
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(HEDERA_SIGN_MESSAGE);
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
      payload: HEDERA_SIGN_MESSAGE,
      handler: handleSignMessage
    },
  ];

  return (
    <div className="space-y-4">
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
