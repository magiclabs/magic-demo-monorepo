"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ConsoleLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  method?: string;
  data?: any;
}

interface ConsoleContextType {
  consoleLogs: ConsoleLog[];
  logToConsole: (type: 'info' | 'success' | 'error' | 'warning', message: string, method?: string, data?: any) => void;
  clearConsole: () => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  const logToConsole = (type: 'info' | 'success' | 'error' | 'warning', message: string, method?: string, data?: any) => {
    const logEntry: ConsoleLog = {
      id: Date.now().toString(),
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
