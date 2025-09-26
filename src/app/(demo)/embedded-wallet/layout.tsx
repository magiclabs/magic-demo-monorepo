"use client";

import { MagicService } from "@/lib/get-magic";
import { WalletProvider } from "@/contexts/WalletContext";
import { MobileMenu } from "@/components/MobileMenu";
import { GitHubButton } from "@/components/GitHubButton";
import { MagicDocsButton } from "@/components/MagicDocsButton";
import "../../globals.css";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // initialize Magic
    void MagicService.magic;
  }, []);

  return (
    <WalletProvider>
      <div className="relative">
        {/* Mobile: Hamburger Menu */}
        <MobileMenu>
          <div onClick={() => {}}>
            <GitHubButton className="w-full" />
          </div>
          <div onClick={() => {}}>
            <MagicDocsButton className="w-full" />
          </div>
        </MobileMenu>

        {/* Desktop: Top Right Buttons */}
        <div className="absolute top-8 right-8 z-20 gap-3 hidden sm:flex">
          <GitHubButton className="" />
          <MagicDocsButton className="" />
        </div>
        {children}
      </div>
    </WalletProvider>
  );
}
