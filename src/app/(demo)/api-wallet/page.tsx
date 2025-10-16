"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApiWallet } from "@/contexts/ApiWalletContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { GetStartedHeader } from "@/components/GetStartedHeader";
import { Button } from "@/components/Button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import logoGoogle from "public/logos/logo-google.svg";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useApiWallet();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/api-wallet/wallet");
    }
  }, [isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't render the auth form if user is authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative  flex flex-col items-center gap-20">
      <GetStartedHeader
        title="Express API Wallet"
        description="Connect your account to access your secure TEE wallet."
      />

      <Button onClick={() => signIn("google", { redirect: false })}>
        <div className="flex items-center gap-2">
          <Image src={logoGoogle} alt="Google" width={24} height={24} />
          Sign in with Google
        </div>
      </Button>
    </div>
  );
}
