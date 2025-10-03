"use client";

import { Button } from "@/components/Primitives";
import { UserInfo } from "@/components/embedded-wallet/UserInfo";
import { SignMethods } from "@/components/embedded-wallet/wallet/SignMethods";
import { HederaSignMethods } from "@/components/embedded-wallet/wallet/HederaSignMethods";
import { SolanaSignMethods } from "@/components/embedded-wallet/wallet/SolanaSignMethods";
import { useWallet } from "@/contexts/WalletContext";
import { BackButton } from "@/components/BackButton";

export default function WalletPage() {
  const { publicAddress, selectedNetwork, handleLogout } = useWallet();

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-12 pb-20 gap-2 sm:gap-16 sm:p-20">
        <BackButton className="hidden sm:block" />

        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative py-4">
            <h1 className="text-6xl font-bold gradient-text mb-4 leading-tight">
              Magic Wallet
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-3xl blur-2xl opacity-40 scale-110"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl">
          {/* Left Side - Wallet Profile */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            <UserInfo />
            <Button variant="danger" onClick={handleLogout} className="w-full">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>

          {/* Right Side - Signing Methods */}
          <div className="w-full lg:w-2/3">
            {selectedNetwork === "hedera" ? (
              <HederaSignMethods />
            ) : selectedNetwork === "solana" ? (
              <SolanaSignMethods />
            ) : (
              <SignMethods publicAddress={publicAddress} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
