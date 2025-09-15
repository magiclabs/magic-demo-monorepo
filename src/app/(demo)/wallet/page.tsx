"use client";

import { useState, useEffect } from "react";
import { MagicService } from "../../../lib/get-magic";
import { Button } from "../../../components/Primitives";
import { EmailOTPAuth } from "../../../components/EmailOTPAuth";
import { OAuthAuth } from "../../../components/OAuthAuth";
import { useConsole } from "../../../contexts/ConsoleContext";

export default function WalletPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { logToConsole } = useConsole();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      logToConsole('info', 'Checking authentication status...', 'magic.user.isLoggedIn');
      const isLoggedIn = await MagicService.magic.user.isLoggedIn();
      if (isLoggedIn) {
        const userMetadata = await MagicService.magic.user.getInfo();
        setIsAuthenticated(true);
        logToConsole('success', 'User is already authenticated', 'magic.user.getInfo', userMetadata);
      } else {
        logToConsole('info', 'User is not authenticated', 'magic.user.isLoggedIn');
      }
    } catch (error) {
      logToConsole('error', 'Error checking auth status', 'magic.user.isLoggedIn', error);
      console.error("Error checking auth status:", error);
    }
  };



  const handleLogout = async () => {
    try {
      logToConsole('info', 'Logging out user...', 'magic.user.logout');
      await MagicService.magic.user.logout();
      setIsAuthenticated(false);
      logToConsole('success', 'User logged out successfully', 'magic.user.logout');
    } catch (error) {
      logToConsole('error', 'Logout error', 'magic.user.logout', error);
      console.error("Logout error:", error);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      const userMetadata = await MagicService.magic.user.getInfo();
      setIsAuthenticated(true);
      logToConsole('success', 'Authentication successful', 'magic.user.getInfo', { userMetadata });
    } catch (error) {
      logToConsole('error', 'Error getting user info after auth', 'magic.user.getInfo', error);
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
            {/* User Info */}
            <div className="glass rounded-xl p-6 border border-primary/20 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to your Wallet!</h2>
              <p className="text-muted-foreground mb-4">You are successfully authenticated with Magic.</p>
            </div>

            {/* Logout Button */}
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
              Disconnect
            </Button>
          </div>
        
      </div>
    </div>
  );
}
