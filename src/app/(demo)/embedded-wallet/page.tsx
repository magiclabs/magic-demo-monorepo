"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmailOTPAuth } from "@/components/embedded-wallet/auth/EmailOTPAuth";
import { OAuthAuth } from "@/components/embedded-wallet/auth/OAuthAuth";
import { useEmbeddedWallet } from "@/contexts/EmbeddedWalletContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import {
  LoginResult,
  MagicWidget,
  ThirdPartyWallets,
} from "@magic-ext/wallet-kit";

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

  const handleSuccess = (response: LoginResult) => {
    localStorage.setItem("magic_widget_login_method", response.method);
    router.push("/embedded-wallet/wallet");
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-0 sm:pt-12 pb-20 gap-10 sm:gap-16 sm:p-10 sm:pr-4 lg:p-20">
        {/* Header */}
        <PageHeader
          product="Embedded Wallet"
          title="Get Started"
          description="Connect your account using Magic's embedded wallet authentication"
        />

        <div className="flex flex-col [@media(min-width:1070px)]:flex-row justify-center items-center [@media(min-width:1070px)]:items-start gap-20 w-full">
          <div className="flex flex-col items-center gap-5">
            <h3 className="text-2xl font-bold my-6">Wallet Kit</h3>
            <MagicWidget
              wallets={[
                ThirdPartyWallets.METAMASK,
                ThirdPartyWallets.COINBASE,
                ThirdPartyWallets.PHANTOM,
                ThirdPartyWallets.RABBY,
                ThirdPartyWallets.WALLETCONNECT,
              ]}
              onSuccess={(response) => handleSuccess(response)}
            />
          </div>

          <div className="flex flex-col items-center gap-10 w-full max-w-[400px]">
            {/* Email OTP Authentication */}
            <EmailOTPAuth onSuccess={fetchAllNetworkAddresses} />

            <div className="h-px [@media(min-width:820px)]:w-400px w-full [@media(min-width:820px)]:h-px bg-slate-3 flex-shrink-0" />

            {/* OAuth Authentication */}
            <OAuthAuth />
          </div>
        </div>
      </div>
    </div>
  );
}
