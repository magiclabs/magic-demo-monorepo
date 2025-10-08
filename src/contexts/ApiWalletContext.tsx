"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { walletService } from "@/lib/api-wallet/wallet";
import { useConsole, LogType, LogMethod } from "./ConsoleContext";

interface ApiWalletContextType {
  publicAddress: string | null;
  selectedNetwork: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: any | null;
  session: any | null;
  handleNetworkChange: (network: string) => void;
  handleLogout: () => Promise<void>;
}

const ApiWalletContext = createContext<ApiWalletContextType | undefined>(undefined);

export function ApiWalletProvider({ children }: { children: ReactNode }) {
  const [publicAddress, setPublicAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("api-wallet-network") || "ethereum";
    }
    return "ethereum";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  
  const { logToConsole } = useConsole();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Update user info when session changes
  useEffect(() => {
    if (session?.user) {
      setUserInfo(session.user);
      setIsAuthenticated(true);
    } else {
      setUserInfo(null);
      setIsAuthenticated(false);
    }
  }, [session]);

  // Handle authentication status changes
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else if (status === "authenticated") {
      setIsAuthenticated(true);
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setIsAuthenticated(false);
      setIsLoading(false);
      setPublicAddress(null);
      router.push('/api-wallet');
    }
  }, [status, router]);

  // Reusable function to create/fetch wallet address
  const createOrFetchWallet = useCallback(async () => {
    if (!isAuthenticated) return null;
    
    try {
      setIsLoading(true);      
      const address = await walletService.getOrCreateWallet(selectedNetwork);
      setPublicAddress(address);
      return address;
    } catch (error: any) {
      
      // Only sign out if it's an auth-related error
      if (error.requiresReauth) {
        console.log("Auth error detected, signing out...");
        await signOut();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedNetwork, logToConsole]);

  // Load wallet address when authenticated
  useEffect(() => {
    if (isAuthenticated && !publicAddress) {
      createOrFetchWallet();
    }
  }, [isAuthenticated, publicAddress]);

  const handleNetworkChange = useCallback(async (network: string) => {
    if (network === selectedNetwork) return;
    
    try {
      logToConsole(LogType.INFO, LogMethod.TEE_GET_WALLET, `Switching to ${network} network...`);
      
      // Create new wallet for the selected network using reusable function
      const newAddress = await createOrFetchWallet();
      
      // Update state with new network
      setSelectedNetwork(network);
      localStorage.setItem("api-wallet-network", network);
      
      logToConsole(LogType.SUCCESS, LogMethod.TEE_GET_WALLET, `Network changed to ${network}`, { 
        network, 
        address: newAddress,
        previousNetwork: selectedNetwork 
      });
    } catch (error: any) {
      logToConsole(LogType.ERROR, LogMethod.TEE_GET_WALLET, `Error switching to ${network}`, error.message);
      console.error(`Failed to create wallet for network: ${network}`, error);
      
      // Reset to previous network on error
      logToConsole(LogType.WARNING, LogMethod.TEE_GET_WALLET, `Reverting to previous network: ${selectedNetwork}`);
    }
  }, [selectedNetwork, createOrFetchWallet, logToConsole]);

  const handleLogout = useCallback(async () => {
    try {
      logToConsole(LogType.INFO, LogMethod.NEXTAUTH_SIGNOUT, 'Logging out user...');
      await signOut({ callbackUrl: '/api-wallet' });
      setPublicAddress(null);
      setIsAuthenticated(false);
      logToConsole(LogType.SUCCESS, LogMethod.NEXTAUTH_SIGNOUT, 'User logged out successfully');
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.NEXTAUTH_SIGNOUT, 'Logout error', error);
      console.error("Logout error:", error);
    }
  }, [logToConsole]);

  const value: ApiWalletContextType = {
    publicAddress,
    selectedNetwork,
    isAuthenticated,
    isLoading,
    userInfo,
    session,
    handleNetworkChange,
    handleLogout,
  };

  return (
    <ApiWalletContext.Provider value={value}>
      {children}
    </ApiWalletContext.Provider>
  );
}

export function useApiWallet() {
  const context = useContext(ApiWalletContext);
  if (context === undefined) {
    throw new Error('useApiWallet must be used within an ApiWalletProvider');
  }
  return context;
}
