"use client";

import { ConsoleProvider } from "@/contexts/ConsoleContext";
import { ConsolePanel } from "@/components/ConsolePanel";
import { Header } from "@/components/Header";
import { usePathname } from "next/navigation";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isApiWalletRoute = pathname?.startsWith("/api-wallet");
  const isDemoRoute =
    pathname?.startsWith("/api-wallet") ||
    pathname?.startsWith("/embedded-wallet");

  return (
    <ConsoleProvider>
      <div className="relative min-h-screen max-[740px]:overflow-hidden">
        {isDemoRoute ? (
          <div className="min-h-screen flex">
            <div className="flex-1 flex flex-col">
              <Header />
              <div className="flex-1 relative max-[740px]:overflow-hidden">
                {children}
              </div>
            </div>
            {!isApiWalletRoute && <ConsolePanel />}
          </div>
        ) : (
          <>
            <Header />
            {children}
          </>
        )}
      </div>
    </ConsoleProvider>
  );
};
