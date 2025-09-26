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
        <MobileMenu />

        {/* Desktop: Positioned buttons */}
        <div className="hidden sm:block">
          <BackButton />
          <div className="absolute top-8 right-8 z-20">
            <a
              href="https://tee.express.magiclabs.com/docs"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 glow-primary"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View TEE Express Docs
            </a>
          </div>
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
            <SignOutButton />
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
