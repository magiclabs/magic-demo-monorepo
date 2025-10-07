"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "@/lib/get-magic";
import { useConsole, LogType, LogMethod } from "./ConsoleContext";
import { ethers } from "ethers";

interface WalletContextType {
  publicAddress: string | null;
  selectedNetwork: string;
  networkAddresses: Record<string, string | null>;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: any | null;
  handleNetworkChange: (network: string) => void;
  handleLogout: () => Promise<void>;
  fetchAllNetworkAddresses: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicAddress, setPublicAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [networkAddresses, setNetworkAddresses] = useState<Record<string, string | null>>({
    polygon: null,
    ethereum: null,
    optimism: null,
    hedera: null,
    solana: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  
  const { logToConsole } = useConsole();
  const router = useRouter();

  // Load persisted network selection on component mount
  useEffect(() => {
    const savedNetwork = localStorage.getItem('magic_selectedNetwork');
    if (savedNetwork && ['polygon', 'ethereum', 'optimism', 'hedera', 'solana'].includes(savedNetwork)) {
      setSelectedNetwork(savedNetwork);
    }
  }, []);

  // Update public address when selected network or network addresses change
  useEffect(() => {
    const networkAddress = networkAddresses[selectedNetwork];
    if (networkAddress) {
      setPublicAddress(networkAddress);
    }
  }, [selectedNetwork, networkAddresses]);

  const fetchAllNetworkAddresses = useCallback(async () => {
    try {
      const addresses: Record<string, string | null> = {
        polygon: null,
        ethereum: null,
        optimism: null,
        hedera: null,
        solana: null,
      };

      // Fetch user info
      try {
        const fetchedUserInfo = await MagicService.magic.user.getInfo();
        logToConsole(LogType.INFO, LogMethod.MAGIC_USER_GET_INFO, 'User info fetched', fetchedUserInfo);
        
        // Store user info for other components to use
        setUserInfo(fetchedUserInfo);
        
        // Extract addresses from user info wallets object
        if (fetchedUserInfo.wallets) {
          // EVM networks (Polygon, Ethereum, Optimism) use the same eth address
          if (fetchedUserInfo.wallets.eth?.publicAddress) {
            addresses.polygon = fetchedUserInfo.wallets.eth.publicAddress;
            addresses.ethereum = fetchedUserInfo.wallets.eth.publicAddress;
            addresses.optimism = fetchedUserInfo.wallets.eth.publicAddress;
            setPublicAddress(fetchedUserInfo.wallets.eth.publicAddress); // Set default to the EVM address
          }

          // Hedera address
          if (fetchedUserInfo.wallets.hedera?.publicAddress) {
            addresses.hedera = fetchedUserInfo.wallets.hedera.publicAddress;
          }

          // Solana address
          if (fetchedUserInfo.wallets.solana?.publicAddress) {
            addresses.solana = fetchedUserInfo.wallets.solana.publicAddress;
          }
        }
      } catch (error) {
        logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error fetching user info', error);
      }

      setNetworkAddresses(addresses);
      logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_GET_INFO, 'Network addresses fetched', addresses);
    } catch (error) {
      logToConsole(LogType.ERROR, LogMethod.MAGIC_USER_GET_INFO, 'Error fetching network addresses', error);
    }
  }, [logToConsole]);

  const checkAuthStatus = useCallback(async () => {
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
  }, []);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    
    // Persist network selection to localStorage
    localStorage.setItem('magic_selectedNetwork', network);
    
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
        setIsAuthenticated(false);
        logToConsole(LogType.SUCCESS, LogMethod.MAGIC_USER_LOGOUT, 'User logged out successfully');
        router.replace('/embedded-wallet');
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
    userInfo,
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

export function useEmbeddedWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useEmbeddedWallet must be used within a WalletProvider');
  }
  return context;
}
