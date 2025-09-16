"use client";

import { Button } from "../../../../components/Primitives";
import { UserInfo } from "../../../../components/embedded-wallet/UserInfo";
import { SignMethods } from "../../../../components/embedded-wallet/SignMethods";
import { HederaSignMethods } from "../../../../components/embedded-wallet/HederaSignMethods";
import { useWallet } from "../../../../contexts/WalletContext";

export default function WalletPage() {
  const { 
    publicAddress, 
    selectedNetwork, 
    handleLogout,
    isLoading 
  } = useWallet();

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
        <div
          className="floating-orb absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-xl"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        {/* Top Right Buttons */}
        <div className="absolute top-8 right-8 z-20 flex gap-3">
          <a
            href="https://github.com/magiclabs/nextauth-api-wallets-express-demo"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View GitHub
          </a>
          <a
            href="https://magic.link/docs"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 glow-primary"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View Magic Docs
          </a>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <h1 className="text-6xl font-bold gradient-text mb-4">
              Magic Wallet
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg blur opacity-20"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-7xl">
          {/* Left Side - Wallet Profile */}
          <div className="flex flex-col gap-8 w-full lg:w-1/2">
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
          <div className="w-full lg:w-1/2">
            {selectedNetwork === "hedera" ? (
              <HederaSignMethods />
            ) : (
              <SignMethods publicAddress={publicAddress} />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
