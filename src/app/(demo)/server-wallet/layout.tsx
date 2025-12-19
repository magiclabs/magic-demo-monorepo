"use client";

import SessionProviderComponent from "../../../providers/SessionProvider";
import { ApiWalletProvider } from "@/contexts/ApiWalletContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderComponent>
      <ApiWalletProvider>{children}</ApiWalletProvider>
    </SessionProviderComponent>
  );
}
