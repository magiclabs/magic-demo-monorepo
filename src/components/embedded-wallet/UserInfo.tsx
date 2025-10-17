"use client";

import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { Dropdown } from "@/components/Dropdown";
import { WalletAddress } from "@/components/WalletAddress";
import { Card } from "../Card";
import IconProfile from "public/icons/icon-profile.svg";
import { Button } from "../Button";

export function UserInfo() {
  const {
    publicAddress,
    selectedNetwork,
    handleNetworkChange,
    userInfo,
    handleLogout,
  } = useEmbeddedWallet();

  const networks = [
    { value: "polygon", label: "Polygon" },
    { value: "ethereum", label: "Ethereum" },
    { value: "optimism", label: "Optimism" },
    { value: "hedera", label: "Hedera" },
    { value: "solana", label: "Solana" },
  ];

  return (
    <Card icon={IconProfile} title={userInfo?.email} className="mb-10">
      <div className="flex flex-col gap-6">
        <Dropdown
          options={networks}
          selectedValue={selectedNetwork}
          onSelect={handleNetworkChange}
        />

        <WalletAddress address={publicAddress} />

        <Button onClick={handleLogout} variant="secondary" fullWidth>
          Logout
        </Button>
      </div>
    </Card>
  );
}
