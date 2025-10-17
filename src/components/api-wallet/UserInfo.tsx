"use client";

import { useApiWallet } from "@/contexts/ApiWalletContext";
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
  } = useApiWallet();
  const { name, email } = userInfo || {};

  const networks = [
    { value: "ethereum", label: "Ethereum" },
    { value: "solana", label: "Solana" },
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
    <Card
      icon={IconProfile}
      title={name}
      subtitle={email}
      className="w-full max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Network
          </label>
          <Dropdown
            options={networks}
            selectedValue={selectedNetwork}
            onSelect={handleNetworkChangeClick}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Wallet Address
          </label>
          <WalletAddress address={publicAddress} isLoading={isLoading} />
        </div>

        <Button onClick={handleLogout} variant="secondary" fullWidth>
          Logout
        </Button>
      </div>
    </Card>
  );
}
