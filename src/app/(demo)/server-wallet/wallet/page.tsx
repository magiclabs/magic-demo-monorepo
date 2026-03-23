"use client";

import { SolanaSignMethods } from "@/components/server-wallet/SolanaSignMethods";
import { EVMSignMethods } from "@/components/server-wallet/EVMSignMethods";
import { AlchemySmartWallet } from "@/components/server-wallet/AlchemySmartWallet";
import { MorphoYield } from "@/components/server-wallet/MorphoYield";
import { SendUSDC } from "@/components/server-wallet/SendUSDC";
import { SendUSDCSolana } from "@/components/server-wallet/SendUSDCSolana";
import { LiFiSwap } from "@/components/server-wallet/LiFiSwap";
import { AaveYield } from "@/components/server-wallet/AaveYield";
import { UserInfo } from "@/components/server-wallet/UserInfo";
import { useServerWallet } from "@/contexts/ServerWalletContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import UserMethods from "@/components/server-wallet/UserMethods";

export default function ServerWalletPage() {
  const { selectedNetwork, isAuthenticated, isLoading } = useServerWallet();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-0 sm:pt-12 pb-20 gap-2 sm:gap-16 sm:p-20">
        <PageHeader product="Server Wallet" title="Connected" />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl mt-16 sm:mt-8">
          {/* Left Side - Wallet Profile */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            <UserInfo />
          </div>

          {/* Right Side - Signing Methods */}
          <div className="w-full lg:w-2/3 flex flex-col gap-18">
            {/* Show Solana methods if Solana network is selected */}
            {selectedNetwork === "solana" ? (
              <>
                <SolanaSignMethods />
                <SendUSDCSolana />
              </>
            ) : (
              /* Default to EVM methods for Ethereum and other EVM networks */
              <>
                <EVMSignMethods />
                <AlchemySmartWallet />
                <MorphoYield />
                <SendUSDC />
                <LiFiSwap />
                <AaveYield />
              </>
            )}

            <UserMethods />
          </div>
        </div>
      </div>
    </div>
  );
}
