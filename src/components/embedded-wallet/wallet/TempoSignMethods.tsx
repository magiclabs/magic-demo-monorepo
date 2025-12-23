import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { TabsContent } from "@radix-ui/react-tabs";
import { SigningMethodsLayout } from "@/components/SigningMethodsLayout";
import { getMagicWalletClient, getTempoBalance, getTempoBalanceRaw, requestFaucetFunds, TIP20_TOKEN, TIP20_ABI } from "@/lib/embedded-wallet/viem-client";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { PERSONAL_SIGN_PAYLOAD } from "@/const/sign-typed-data-payloads";

export function TempoSignMethods() {
  const { publicAddress } = useEmbeddedWallet();
  const [balance, setBalance] = useState<string>('0');

  // Fetch balance on mount and when address changes
  useEffect(() => {
    if (!publicAddress) return;
    getTempoBalance(publicAddress as `0x${string}`)
      .then(setBalance)
      .catch(() => setBalance('0'));
  }, [publicAddress]);

  const handlePersonalSign = async (): Promise<string> => {
    const client = await getMagicWalletClient();
    const [address] = await client.getAddresses();

    return await client.signMessage({
      account: address,
      message: PERSONAL_SIGN_PAYLOAD,
    });
  };

  const handleSendTransaction = async (): Promise<string> => {
    if (!publicAddress) throw new Error('No address');

    // Get raw bigint balance
    let currentBalance = await getTempoBalanceRaw(publicAddress as `0x${string}`);

    // If balance is 0, request funds from faucet
    if (currentBalance === BigInt(0)) {
      await requestFaucetFunds(publicAddress as `0x${string}`);
      currentBalance = await getTempoBalanceRaw(publicAddress as `0x${string}`);
    }

    if (currentBalance === BigInt(0)) {
      throw new Error('Failed to get funds from faucet');
    }

    // Send half the balance (always less than balance)
    const sendAmount = currentBalance / BigInt(2);

    const client = await getMagicWalletClient();
    const [address] = await client.getAddresses();

    // Use writeContract to call TIP-20 transfer function (no native ETH on Tempo)
    const hash = await client.writeContract({
      address: TIP20_TOKEN,
      abi: TIP20_ABI,
      functionName: 'transfer',
      args: [address, sendAmount],
      account: address,
    });

    // Refresh balance after transaction
    const newBalance = await getTempoBalance(publicAddress as `0x${string}`);
    setBalance(newBalance);

    return `Sent: ${formatUnits(sendAmount, 18)} TIP-20\nhttps://explore.tempo.xyz/tx/${hash}`;
  };

  const handleGetBalance = async (): Promise<string> => {
    if (!publicAddress) throw new Error('No address');
    const newBalance = await getTempoBalance(publicAddress as `0x${string}`);
    setBalance(newBalance);
    return `${newBalance} TIP-20`;
  };

  const handleRequestFaucet = async (): Promise<string> => {
    if (!publicAddress) throw new Error('No address');

    const result = await requestFaucetFunds(publicAddress as `0x${string}`);
    setBalance(result.balance);

    return `Funded! New balance: ${result.balance} TIP-20\nReceipts:\n${result.receipts?.map(h => `https://explore.tempo.xyz/tx/${h}`).join('\n')}`;
  };

  const tabs = [
    {
      value: "faucet",
      label: "Request Faucet",
      functionName: "Actions.faucet.fundSync(client, { account })",
      payload: { account: publicAddress },
      handler: handleRequestFaucet,
    },
    {
      value: "personal",
      label: "Personal Sign",
      functionName: "magicWalletClient.signMessage({ account, message })",
      payload: PERSONAL_SIGN_PAYLOAD,
      handler: handlePersonalSign,
    },
    {
      value: "send-tx",
      label: "Send Transaction",
      functionName: "magicWalletClient.writeContract({ address, abi, functionName, args })",
      payload: { to: publicAddress, value: `${(parseFloat(balance) / 2).toFixed(18).replace(/\.?0+$/, '')} TIP-20` },
      handler: handleSendTransaction,
    },
    {
      value: "balance",
      label: "Get Balance",
      functionName: "Actions.token.getBalance(client, { token, account })",
      payload: { account: publicAddress },
      handler: handleGetBalance,
    },
  ];

  return (
    <SigningMethodsLayout
      title="Tempo (viem) Methods"
      description="Test transactions on Tempo Testnet using viem and tempo.ts"
      defaultTab="faucet"
      tabs={tabs}
    >
      <TabsContent value="faucet" />
      <TabsContent value="personal" />
      <TabsContent value="send-tx" />
      <TabsContent value="balance" />
    </SigningMethodsLayout>
  );
}