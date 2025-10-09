"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export enum LogType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export enum LogMethod {
  MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP = 'magic.auth.loginWithEmailOTP',
  MAGIC_AUTH_LOGIN_WITH_MAGIC_LINK = 'magic.auth.loginWithMagicLink',
  MAGIC_OAUTH_LOGIN_WITH_POPUP = 'magic.oauth.loginWithPopup',
  MAGIC_USER_IS_LOGGED_IN = 'magic.user.isLoggedIn',
  MAGIC_USER_GET_INFO = 'magic.user.getInfo',
  MAGIC_USER_LOGOUT = 'magic.user.logout',
  TEE_GET_WALLET = 'tee.getWallet',
  NEXTAUTH_SIGNOUT = 'nextauth.signOut'
}

interface ConsoleLog {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  method?: LogMethod;
  data?: unknown;
}

interface ConsoleContextType {
  consoleLogs: ConsoleLog[];
  logToConsole: (type: LogType, method: LogMethod, message: string, data?: unknown) => void;
  clearConsole: () => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  const logToConsole = (type: LogType, method: LogMethod, message: string, data?: unknown) => {
    const logEntry: ConsoleLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      method,
      data
    };
    setConsoleLogs(prev => [...prev, logEntry]);
  };

  const clearConsole = () => {
    setConsoleLogs([]);
  };

  return (
    <ConsoleContext.Provider value={{ consoleLogs, logToConsole, clearConsole }}>
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (context === undefined) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
}
