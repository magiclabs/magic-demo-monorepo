"use client";

import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { WalletProvider } from "@/contexts/EmbeddedWalletContext";
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

  return <WalletProvider>{children}</WalletProvider>;
}
