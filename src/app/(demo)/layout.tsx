"use client";

import { ConsoleProvider } from "../../contexts/ConsoleContext";
import { ConsolePanel } from "@/components/ConsolePanel";
import { usePathname } from "next/navigation";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isApiWalletRoute = pathname?.startsWith("/api-wallet");

  return (
    <ConsoleProvider>
      <div className="min-h-screen flex">
        <div className="flex-1 relative max-[740px]:overflow-hidden">
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

          {children}
        </div>
        {!isApiWalletRoute && <ConsolePanel />}
      </div>
    </ConsoleProvider>
  );
}
