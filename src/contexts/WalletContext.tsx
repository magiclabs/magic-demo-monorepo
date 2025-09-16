"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "../lib/get-magic";
import { useConsole, LogType, LogMethod } from "./ConsoleContext";
import { ethers } from "ethers";

interface WalletContextType {
  publicAddress: string | null;
  selectedNetwork: string;
  networkAddresses: Record<string, string | null>;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleNetworkChange: (network: string) => void;
  handleLogout: () => Promise<void>;
  fetchAllNetworkAddresses: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicAddress, setPublicAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("polygon");
  const [networkAddresses, setNetworkAddresses] = useState<Record<string, string | null>>({
    polygon: null,
    ethereum: null,
    optimism: null,
    hedera: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { logToConsole } = useConsole();
  const router = useRouter();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      logToConsole(LogType.INFO, LogMethod.MAGIC_USER_IS_LOGGED_IN, 'Checking authentication status...');
      const isLoggedIn = await MagicService.magic.user.isLoggedIn();
      if (isLoggedIn) {
        setIsAuthenticated(true);
        await fetchAllNetworkAddresses();
      } else {
        setIsAuthenticated(false);
        logToConsole(LogType.INFO, LogMethod.MAGIC_USER_IS_LOGGED_IN, 'User is not authenticated, redirecting to embedded-wallet page');
        router.push('/embedded-wallet');
      }
    } catch (error: unknown) {
      const err = error as Error;
      setIsAuthenticated(false);
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_IS_LOGGED_IN, 'Error checking auth status', err.message);
      console.error("Error checking auth status:", error);
      router.push('/embedded-wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllNetworkAddresses = async () => {
    try {
      const addresses: Record<string, string | null> = {
        polygon: null,
        ethereum: null,
        optimism: null,
        hedera: null,
      };

      // Fetch EVM addresses (Polygon, Ethereum, Optimism)
      try {
        const provider = new ethers.BrowserProvider(
          MagicService.magic.rpcProvider as any,
        );
        const accounts = await provider.listAccounts();
        const evmAddress = accounts[0]?.address;
        
        if (evmAddress) {
          addresses.polygon = evmAddress;
          addresses.ethereum = evmAddress;
          addresses.optimism = evmAddress;
          setPublicAddress(evmAddress); // Set default to EVM address
        }
      } catch (error) {
        logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error fetching EVM addresses', error);
      }

      // Fetch Hedera address
      try {
        const magic = MagicService.magic as any;
        if (magic.hedera) {
          const { publicKeyDer } = await magic.hedera.getPublicKey();
          // For Hedera, we'll use the public key as the identifier
          addresses.hedera = publicKeyDer;
        }
      } catch (error) {
        logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error fetching Hedera address', error);
      }

      setNetworkAddresses(addresses);
      logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_GET_INFO, 'Network addresses fetched', addresses);
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error fetching network addresses', error);
    }
  };

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    
    // Update the public address based on the selected network
    const networkAddress = networkAddresses[network];
    if (networkAddress) {
      setPublicAddress(networkAddress);
      logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_GET_INFO, `Network changed to: ${network}`, { address: networkAddress });
    } else {
      logToConsole(LogType.WARNING, LogMethod.MAGIC_USER_GET_INFO, `No address found for network: ${network}`);
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

  const value: WalletContextType = {
    publicAddress,
    selectedNetwork,
    networkAddresses,
    isAuthenticated,
    isLoading,
    handleNetworkChange,
    handleLogout,
    fetchAllNetworkAddresses,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
