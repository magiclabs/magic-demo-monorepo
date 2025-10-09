"use client";

import "../../globals.css";
import SessionProviderComponent from "../../../providers/SessionProvider";
import { ApiWalletProvider } from "@/contexts/ApiWalletContext";
import { ConsoleProvider } from "@/contexts/ConsoleContext";
import { MobileMenu } from "@/components/MobileMenu";
import { TeeDocsButton } from "@/components/TeeDocsButton";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderComponent>
      <ConsoleProvider>
        <ApiWalletProvider>
          <div className="relative">
            {/* Mobile: Hamburger Menu */}
            <MobileMenu hasConsole={true}>
              <div onClick={() => {}}>
                <TeeDocsButton className="w-full" />
              </div>
            </MobileMenu>

            {/* Desktop: Top Right Buttons */}
            <div className="absolute top-8 right-8 z-20 gap-3 hidden sm:flex">
              <TeeDocsButton className="" />
            </div>
            {children}
          </div>
        </ApiWalletProvider>
      </ConsoleProvider>
    </SessionProviderComponent>
  );
}
