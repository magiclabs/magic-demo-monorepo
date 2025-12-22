"use client";

import { useServerWallet } from "@/contexts/ServerWalletContext";
import { Card } from "@/components/Card";
import { Dropdown } from "@/components/Dropdown";
import { WalletAddress } from "@/components/WalletAddress";
import IconProfile from "public/icons/icon-profile.svg";
import { Button } from "../Button";

export function UserInfo() {
  const {
    publicAddress,
    selectedNetwork,
    userInfo,
    isLoading,
    handleNetworkChange,
    handleLogout,
  } = useServerWallet();
  const { name, email } = userInfo || {};

  const networks = [
    { value: "ethereum", label: "Ethereum" },
    { value: "solana", label: "Solana" },
    { value: "bitcoin", label: "Bitcoin" },
  ];

  // Handle network change
  const handleNetworkChangeClick = async (network: string) => {
    if (network === selectedNetwork) return;

    try {
      await handleNetworkChange(network);
    } catch (error) {
      console.error("Failed to change network:", network, error);
    }
  };

  return (
    <Card icon={IconProfile} title={name} subtitle={email} className="mb-10">
      <div className="flex flex-col gap-6">
        <Dropdown
          options={networks}
          selectedValue={selectedNetwork}
          onSelect={handleNetworkChangeClick}
          isLoading={isLoading}
        />

        <WalletAddress address={publicAddress} />

        <Button onClick={handleLogout} variant="secondary" fullWidth>
          Logout
        </Button>
      </div>
    </Card>
  );
}
