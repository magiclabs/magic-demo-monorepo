"use client";

import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { Dropdown } from "@/components/Dropdown";
import { WalletAddress } from "@/components/WalletAddress";

export function UserInfo() {
  const {
    publicAddress,
    selectedNetwork,
    handleNetworkChange,
    userInfo,
    handleLogout,
  } = useEmbeddedWallet();

  const networks = [
    { value: "polygon", label: "Polygon", color: "bg-purple-500" },
    { value: "ethereum", label: "Ethereum", color: "bg-blue-500" },
    { value: "optimism", label: "Optimism", color: "bg-red-500" },
    { value: "hedera", label: "Hedera", color: "bg-green-500" },
    { value: "solana", label: "Solana", color: "bg-orange-500" },
  ];

  return (
    <div className="glass p-8 rounded-2xl w-full lg:max-w-2xl glow-primary">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex flex-shrink-0 items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
          <p className="text-muted-foreground">
            Your Magic embedded wallet information
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {userInfo?.email && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </label>
            <div className="text-lg font-semibold text-white">
              {userInfo.email}
            </div>
          </div>
        )}

        {userInfo?.issuer && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              User ID
            </label>
            <div className="font-semibold text-white font-mono text-sm break-all">
              {userInfo.issuer}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Network
          </label>
          <Dropdown
            options={networks}
            selectedValue={selectedNetwork}
            onSelect={handleNetworkChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary tracking-wide">
            Wallet Address
          </label>
          <WalletAddress address={publicAddress} />
        </div>

        {/* Logout Button */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors px-4 py-2 rounded-lg cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
