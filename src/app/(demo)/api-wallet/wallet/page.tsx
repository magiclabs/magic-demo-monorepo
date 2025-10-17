"use client";

import { SolanaSignMethods } from "@/components/api-wallet/SolanaSignMethods";
import { EVMSignMethods } from "@/components/api-wallet/EVMSignMethods";
import { UserInfo } from "@/components/api-wallet/UserInfo";

import { useApiWallet } from "@/contexts/ApiWalletContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";

export default function ApiWalletPage() {
  const { selectedNetwork, isAuthenticated, isLoading } = useApiWallet();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-12 pb-20 gap-2 sm:gap-16 sm:p-20">
        <PageHeader product="Express API Wallet" title="Connected" />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl  mt-8">
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
