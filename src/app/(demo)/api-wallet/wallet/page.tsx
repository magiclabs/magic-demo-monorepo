"use client";

import { useRouter } from "next/navigation";
import { SolanaSignMethods } from "@/components/api-wallet/SolanaSignMethods";
import { EVMSignMethods } from "@/components/api-wallet/EVMSignMethods";
import { UserInfo } from "@/components/api-wallet/UserInfo";
import { BackButton } from "@/components/BackButton";
import { useApiWallet } from "@/contexts/ApiWalletContext";

export default function ApiWalletPage() {
  const { 
    selectedNetwork, 
    isAuthenticated, 
    isLoading
  } = useApiWallet();

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-12 pb-20 gap-2 sm:gap-16 sm:p-20">
        <BackButton className="hidden sm:block" />

        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative py-4">
            <h1 className="text-6xl font-bold gradient-text mb-4 leading-tight">
              Magic API Wallet
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-3xl blur-2xl opacity-40 scale-110"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl">
          {/* Left Side - Wallet Profile */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            <UserInfo />
          </div>

          {/* Right Side - Signing Methods */}
          <div className="w-full lg:w-2/3">
            {/* Show Solana methods if Solana network is selected */}
            {selectedNetwork === "solana" ? (
              <SolanaSignMethods />
            ) : (
              /* Default to EVM methods for Ethereum and other EVM networks */
              <EVMSignMethods />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
