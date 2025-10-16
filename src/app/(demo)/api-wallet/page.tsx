"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton } from "../../../components/api-wallet/AuthButtons";
import { BackButton } from "@/components/BackButton";
import { useApiWallet } from "@/contexts/ApiWalletContext";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useApiWallet();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/api-wallet/wallet");
    }
  }, [isAuthenticated, router]);

  // Show loading state while checking authentication
  if (true) {
    return <LoadingScreen />;
  }

  // Don't render the auth form if user is authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-12 pb-20 gap-2 sm:gap-16 sm:p-20">
        <BackButton className="hidden sm:block" />

        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative py-8 sm:py-4">
            <h1 className="text-6xl font-bold gradient-text mb-4 leading-tight">
              Magic API Wallets
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-3xl blur-2xl opacity-40 scale-110"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Get Started
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect your account to access your secure TEE wallet
            </p>
          </div>

          {/* Sign In Button */}
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
