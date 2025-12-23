import { parseEther } from 'viem';
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { getWalletClient, publicClient } from "@/lib/embedded-wallet/viem-client";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { PERSONAL_SIGN_PAYLOAD } from "@/const/sign-typed-data-payloads";

export function TempoSignMethods() {
  const { publicAddress } = useEmbeddedWallet();

  const handlePersonalSign = async (): Promise<string> => {
    const client = getWalletClient();
    const [address] = await client.getAddresses();
    
    return await client.signMessage({
      account: address,
      message: PERSONAL_SIGN_PAYLOAD,
    });
  };

  const handleSendTransaction = async (): Promise<string> => {
    const client = getWalletClient();
    const [address] = await client.getAddresses();
    
    const hash = await client.sendTransaction({
      account: address,
      to: address,
      value: parseEther('0.0001'),
    });
    
    return hash;
  };

  const handleGetBalance = async (): Promise<string> => {
    if (!publicAddress) throw new Error('No address');
    
    const balance = await publicClient.getBalance({
      address: publicAddress as `0x${string}`,
    });
    
    return balance.toString();
  };

  const tabs = [
    {
      value: "personal",
      label: "Personal Sign",
      functionName: "walletClient.signMessage({ account, message })",
      payload: PERSONAL_SIGN_PAYLOAD,
      handler: handlePersonalSign,
    },
    {
      value: "send-tx",
      label: "Send Transaction",
      functionName: "walletClient.sendTransaction({ account, to, value })",
      payload: { to: publicAddress, value: "0.0001 TEMPO" },
      handler: handleSendTransaction,
    },
    {
      value: "balance",
      label: "Get Balance",
      functionName: "publicClient.getBalance({ address })",
      payload: { address: publicAddress },
      handler: handleGetBalance,
    },
  ];

  return (
    <SigningMethodsLayout
      title="Tempo (viem) Methods"
      description="Test transactions on Tempo Testnet using viem"
      defaultTab="personal"
      tabs={tabs}
    >
      <TabsContent value="personal" />
      <TabsContent value="send-tx" />
      <TabsContent value="balance" />
    </SigningMethodsLayout>
  );
}