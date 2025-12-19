"use client";

import SessionProviderComponent from "../../../providers/SessionProvider";
import { ServerWalletProvider } from "@/contexts/ServerWalletContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderComponent>
      <ServerWalletProvider>{children}</ServerWalletProvider>
    </SessionProviderComponent>
  );
}
