"use client";

import { ConsoleProvider } from "@/contexts/ConsoleContext";
import { ConsolePanel } from "@/components/ConsolePanel";
import { Header } from "@/components/Header";
import { usePathname } from "next/navigation";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isEmbeddedWalletRoute = pathname?.startsWith("/embedded-wallet");

  return (
    <ConsoleProvider>
      <div className="relative min-h-screen max-[740px]:overflow-hidden">
        <div className="min-h-screen flex">
          <div className="flex-1 flex flex-col">
            <Header />
            <div className="flex-1 relative max-[740px]:overflow-hidden my-10">
              {children}
            </div>
          </div>
          {isEmbeddedWalletRoute && <ConsolePanel />}
        </div>
      </div>
    </ConsoleProvider>
  );
};
