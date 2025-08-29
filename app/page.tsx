"use client";

import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import { UserInfo } from "./components/UserInfo";
import { SignMethods } from "./components/SignMethods";
import { useEffect, useState } from "react";
import { teeService } from "./lib/tee-service";

export default function Home() {
  const { status } = useSession();
  const [publicAddress, setPublicAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!publicAddress && status === "authenticated") {
      teeService.getOrCreateWallet().then((address) => {
        setPublicAddress(address);
      });
    }
  }, [publicAddress, status]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center  min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-4xl font-bold">API Wallet Express</h1>
      {status === "authenticated" && (
        <div className="flex flex-col gap-4">
          <UserInfo publicAddress={publicAddress} />
          <SignMethods publicAddress={publicAddress} />
          <SignOutButton />
        </div>
      )}
      {status === "unauthenticated" && (
        <div className="flex gap-4 mt-4">
          <SignInButton />
        </div>
      )}
    </div>
  );
}
