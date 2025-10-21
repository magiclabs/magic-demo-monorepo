"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmailOTPAuth } from "@/components/embedded-wallet/auth/EmailOTPAuth";
import { OAuthAuth } from "@/components/embedded-wallet/auth/OAuthAuth";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";

export default function Home() {
  const { isAuthenticated, isLoading, fetchAllNetworkAddresses } =
    useEmbeddedWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/embedded-wallet/wallet");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Don't render the auth form if user is authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-0 sm:pt-12 pb-20 gap-10 sm:gap-16 sm:p-10 sm:pr-4 lg:p-20">
        {/* Header */}
        <PageHeader
          product="Embedded Wallet"
          title="Get Started"
          description="Connect your account using Magic's embedded wallet authentication"
        />

        {/* Main Content */}
        <div className="flex flex-col [@media(min-width:820px)]:flex-row items-center gap-10 lg:gap-20 w-full max-w-[820px]">
          {/* Email OTP Authentication */}
          <EmailOTPAuth onSuccess={fetchAllNetworkAddresses} />

          <div className="h-px [@media(min-width:820px)]:h-64 w-full [@media(min-width:820px)]:w-px bg-slate-3 flex-shrink-0" />

          {/* OAuth Authentication */}
          <OAuthAuth />
        </div>
      </div>
    </div>
  );
}
