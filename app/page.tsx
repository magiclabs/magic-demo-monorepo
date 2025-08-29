"use client";

import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import { UserInfo } from "./components/UserInfo";
import { SignMethods } from "./components/SignMethods";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <UserInfo />
      {status === "authenticated" && (
        <div className="flex flex-col gap-4">
          <SignMethods />
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
