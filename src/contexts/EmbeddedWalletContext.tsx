"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { useConsole, LogType, LogMethod } from "./ConsoleContext";

export enum Network {
  POLYGON = "polygon",
  ETHEREUM = "ethereum",
  OPTIMISM = "optimism",
  HEDERA = "hedera",
  SOLANA = "solana",
}

interface WalletContextType {
  publicAddress: string | null;
  selectedNetwork: Network;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: any | null;
  handleNetworkChange: (network: Network) => void;
  handleLogout: () => Promise<void>;
  fetchAllNetworkAddresses: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(
    Network.ETHEREUM
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const { logToConsole } = useConsole();
  const router = useRouter();

  // Helper function to get public address from userInfo based on selected network
  const getPublicAddress = (): string | null => {
    if (!userInfo?.wallets) return null;

    // EVM networks (polygon, ethereum, optimism) all use the ethereum wallet
    if (
      [Network.POLYGON, Network.ETHEREUM, Network.OPTIMISM].includes(
        selectedNetwork
      )
    ) {
      return userInfo.wallets.ethereum?.publicAddress || null;
    }

    // Other networks use their own wallet
    return userInfo.wallets[selectedNetwork]?.publicAddress || null;
  };

  const fetchAllNetworkAddresses = async () => {
    try {
      const fetchedUserInfo = await MagicService.magic.user.getInfo();
      logToConsole(
        LogType.INFO,
        LogMethod.MAGIC_USER_GET_INFO,
        "User info fetched",
        fetchedUserInfo
      );

      // Store user info for other components to use
      setUserInfo(fetchedUserInfo);
      logToConsole(
        LogType.SUCCESS,
        LogMethod.MAGIC_USER_GET_INFO,
        "User info and wallets fetched successfully",
        fetchedUserInfo
      );
    } catch (error) {
      logToConsole(
        LogType.ERROR,
        LogMethod.MAGIC_USER_GET_INFO,
        "Error fetching user info",
        error
      );
    }
  };

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const savedNetwork = localStorage.getItem(
      "magic_selectedNetwork"
    ) as Network | null;
    if (
      savedNetwork &&
      [
        Network.POLYGON,
        Network.ETHEREUM,
        Network.OPTIMISM,
        Network.HEDERA,
        Network.SOLANA,
      ].includes(savedNetwork)
    ) {
      setSelectedNetwork(savedNetwork);
    }
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        logToConsole(
          LogType.INFO,
          LogMethod.MAGIC_USER_IS_LOGGED_IN,
          "Checking authentication status..."
        );
        const isLoggedIn = await MagicService.magic.user.isLoggedIn();
        if (isLoggedIn) {
          setIsAuthenticated(true);
          await fetchAllNetworkAddresses();
        } else {
          setIsAuthenticated(false);
          logToConsole(
            LogType.INFO,
            LogMethod.MAGIC_USER_IS_LOGGED_IN,
            "User is not authenticated, redirecting to embedded-wallet page"
          );
          router.push("/embedded-wallet");
        }
      } catch (error: unknown) {
        const err = error as Error;
        setIsAuthenticated(false);
        logToConsole(
          LogType.ERROR,
          LogMethod.MAGIC_USER_IS_LOGGED_IN,
          "Error checking auth status",
          err.message
        );
        console.error("Error checking auth status:", error);
        router.push("/embedded-wallet");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleNetworkChange = (network: Network) => {
    setSelectedNetwork(network);

    // Persist network selection to localStorage
    localStorage.setItem("magic_selectedNetwork", network);

    // Log the network change
    logToConsole(
      LogType.SUCCESS,
      LogMethod.MAGIC_USER_GET_INFO,
      `Network changed to: ${network}`
    );
  };

  const handleLogout = async () => {
    try {
      logToConsole(
        LogType.INFO,
        LogMethod.MAGIC_USER_LOGOUT,
        "Logging out user..."
      );
      const res = await MagicService.magic.user.logout();
      if (res) {
        setIsAuthenticated(false);
        logToConsole(
          LogType.SUCCESS,
          LogMethod.MAGIC_USER_LOGOUT,
          "User logged out successfully"
        );
        router.replace("/embedded-wallet");
      }
    } catch (error) {
      logToConsole(
        LogType.ERROR,
        LogMethod.MAGIC_USER_LOGOUT,
        "Logout error",
        error
      );
      console.error("Logout error:", error);
    }
  };

  const value: WalletContextType = {
    publicAddress: getPublicAddress(),
    selectedNetwork,
    isAuthenticated,
    isLoading,
    userInfo,
    handleNetworkChange,
    handleLogout,
    fetchAllNetworkAddresses,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useEmbeddedWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useEmbeddedWallet must be used within a WalletProvider");
  }
  return context;
}
