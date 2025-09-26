"use client";

import { useSession } from "next-auth/react";
import {
  SignInButton,
  SignOutButton,
} from "../../../components/api-wallet/AuthButtons";
import { SignMethods } from "@/components/api-wallet/SignMethods";
import { useEffect, useState } from "react";
import { teeService } from "../../../lib/tee-service";
import { UserInfo } from "@/components/api-wallet/UserInfo";
import { BackButton } from "@/components/BackButton";
import { MobileMenu } from "@/components/MobileMenu";
import { TeeDocsButton } from "@/components/TeeDocsButton";

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
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pb-20 pt-16 sm:pt-20 gap-8 sm:gap-16 sm:p-20">
        {/* Mobile: Hamburger Menu */}
        <MobileMenu>
          <div onClick={() => {}}>
            <TeeDocsButton className="w-full" />
          </div>
          {status === "authenticated" && (
            <div onClick={() => {}}>
              <SignOutButton className="h-12" />
            </div>
          )}
        </MobileMenu>

        {/* Desktop: Positioned buttons */}
        <div className="hidden sm:block">
          <BackButton />
          <TeeDocsButton />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative py-4">
            <h1 className="text-6xl font-bold gradient-text mb-4 leading-tight">
              Magic API Wallets
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-3xl blur-2xl opacity-40 scale-110"></div>
          </div>
        </div>

        {/* Main Content */}
        {status === "authenticated" && (
          <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
            <UserInfo publicAddress={publicAddress} />
            <SignMethods publicAddress={publicAddress} />
            <div className="hidden sm:block">
              <SignOutButton />
            </div>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-muted-foreground mb-8">
                Connect your account to access your secure TEE wallet
              </p>
            </div>
            <SignInButton />
          </div>
        )}
      </div>
    </div>
  );
}
