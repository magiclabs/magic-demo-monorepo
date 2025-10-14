"use client";

import { useState, useEffect } from "react";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";

export function UserInfo() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    { value: "algorand", label: "Algorand", color: "bg-blue-500" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest(".dropdown-container")) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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
            <div className="text-lg font-semibold text-white font-mono text-sm break-all">
              {userInfo.issuer}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Network
          </label>
          <div className="relative dropdown-container">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full p-3 bg-black/30 rounded-xl border border-white/10 text-white hover:bg-black/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 ${
                    networks.find((n) => n.value === selectedNetwork)?.color
                  } rounded-full`}
                ></div>
                <span>
                  {networks.find((n) => n.value === selectedNetwork)?.label}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/10 rounded-xl p-1 shadow-lg backdrop-blur-sm z-10">
                {networks.map((network) => (
                  <button
                    key={network.value}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleNetworkChange(network.value);
                    }}
                    className="flex items-center gap-2 w-full p-3 text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-3 h-3 ${network.color} rounded-full`}
                    ></div>
                    <span>{network.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Wallet Address
          </label>
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/10">
            <div className="w-8 h-8 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="font-mono text-sm text-white break-all">
              {publicAddress || "No address available"}
            </span>
            {publicAddress && (
              <button
                onClick={() => navigator.clipboard.writeText(publicAddress)}
                className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer active:scale-95"
                title="Copy address"
              >
                <svg
                  className="w-4 h-4 text-muted-foreground hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
