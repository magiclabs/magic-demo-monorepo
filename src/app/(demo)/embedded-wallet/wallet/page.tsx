"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "../../../../lib/get-magic";
import { Button } from "../../../../components/Primitives";
import { useConsole, LogType, LogMethod } from "../../../../contexts/ConsoleContext";
import { UserInfo } from "../../../../components/embedded-wallet/UserInfo";
import { SignMethods } from "../../../../components/embedded-wallet/SignMethods";

export default function WalletPage() {
  const [publicAddress, setPublicAddress] = useState<string | null>(null);
  const { logToConsole } = useConsole();
  const router = useRouter();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const getWalletAddress = async () => {
    try {
      logToConsole(LogType.INFO, LogMethod.MAGIC_USER_GET_INFO, 'Getting wallet address...');
      const accounts = await MagicService.magic.wallet.getAccounts();
      if (accounts && accounts.length > 0) {
        setPublicAddress(accounts[0]);
        logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_GET_INFO, 'Wallet address retrieved', { address: accounts[0] });
      }
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error getting wallet address', error);
      console.error("Error getting wallet address:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      logToConsole(LogType.INFO, LogMethod.MAGIC_USER_IS_LOGGED_IN, 'Checking authentication status...');
      const isLoggedIn = await MagicService.magic.user.isLoggedIn();
      if (isLoggedIn) {
        const userMetadata = await MagicService.magic.user.getInfo();
        await getWalletAddress();
        logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_GET_INFO, 'User is already authenticated', userMetadata);
      } else {
        logToConsole(LogType.INFO, LogMethod.MAGIC_USER_IS_LOGGED_IN, 'User is not authenticated, redirecting to embedded-wallet page');
        router.push('/embedded-wallet');
      }
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_IS_LOGGED_IN, 'Error checking auth status', error);
      console.error("Error checking auth status:", error);
      router.push('/embedded-wallet');
    }
  };



  const handleLogout = async () => {
    try {
      logToConsole(LogType.INFO, LogMethod.MAGIC_USER_LOGOUT, 'Logging out user...');
      const res = await MagicService.magic.user.logout();
      if (res) {
        setPublicAddress(null);
        logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_LOGOUT, 'User logged out successfully');
        router.push('/embedded-wallet');
      }
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_LOGOUT, 'Logout error', error);
      console.error("Logout error:", error);
    }
  };


  const handleAuthSuccess = async () => {
    try {
      const userMetadata = await MagicService.magic.user.getInfo();
      await getWalletAddress();
      logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_GET_INFO, 'Authentication successful', { userMetadata });
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error getting user info after auth', error);
    }
  };

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
        {/* Top Right Docs Button */}
        <div className="absolute top-8 right-8 z-20">
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
        <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
          <UserInfo publicAddress={publicAddress} />
          <SignMethods publicAddress={publicAddress} />
          <Button variant="danger" onClick={handleLogout}>
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
        
      </div>
    </div>
  );
}
