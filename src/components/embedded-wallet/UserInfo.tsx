"use client";

import { Network, useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { Dropdown } from "@/components/Dropdown";
import { WalletAddress } from "@/components/WalletAddress";
import { Card } from "../Card";
import IconProfile from "public/icons/icon-profile.svg";
import { Button } from "../Button";
import { useEffect, useState } from "react";

export function UserInfo() {
  const {
    publicAddress,
    selectedNetwork,
    handleNetworkChange,
    userInfo,
    handleLogout,
  } = useEmbeddedWallet();

  const [isWalletLogin, setIsWalletLogin] = useState(false);

  useEffect(() => {
    setIsWalletLogin(
      localStorage.getItem("magic_widget_login_method") === "wallet"
    );
  }, []);

  const allNetworks = [
    { value: "ethereum", label: "Ethereum" },
    { value: "polygon", label: "Polygon" },
    { value: "optimism", label: "Optimism" },
    { value: "hedera", label: "Hedera" },
    { value: "solana", label: "Solana" },
  ];

  const networks = isWalletLogin
    ? allNetworks.filter((n) =>
        ["ethereum", "polygon", "optimism"].includes(n.value)
      )
    : allNetworks;

  return (
    <Card icon={IconProfile} title={userInfo?.email} className="mb-10">
      <div className="flex flex-col gap-6">
        <Dropdown
          options={networks}
          selectedValue={selectedNetwork}
          onSelect={(network) => handleNetworkChange(network as Network)}
        />

        <WalletAddress address={publicAddress} />

        <Button onClick={handleLogout} variant="secondary" fullWidth>
          Logout
        </Button>
      </div>
    </Card>
  );
}
