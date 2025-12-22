import { bitcoinService } from "../../lib/server-wallet/bitcoin";
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { TEE_BASE } from "@/lib/server-wallet/express";

export function BTCSignMethods() {
  const { publicAddress, selectedNetwork } = useServerWallet();

  if (!publicAddress || selectedNetwork !== "bitcoin") {
    return null;
  }

  const dataPayload = "Hello Bitcoin World!";

  const handleSignData = async (): Promise<string> => {
    try {
      const result = await bitcoinService.btcSignData(dataPayload);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Failed to sign data:", error);
      throw error;
    }
  };

  const tabs = [
    {
      value: "sign-data",
      label: "Sign Data",
      functionName: `${TEE_BASE}/v1/sign/data`,
      payload: dataPayload,
      handler: handleSignData,
    },
  ];

  return (
    <SigningMethodsLayout
      title="Bitcoin Signing Methods"
      description="Test Bitcoin data signing with Magic API"
      defaultTab="sign-data"
      tabs={tabs}
    >
      <TabsContent value="sign-data" />
    </SigningMethodsLayout>
  );
}