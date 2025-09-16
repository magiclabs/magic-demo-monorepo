"use client";

import { MagicService } from "@/lib/get-magic";
import { WalletProvider } from "@/contexts/WalletContext";
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
    }, [])

  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}
