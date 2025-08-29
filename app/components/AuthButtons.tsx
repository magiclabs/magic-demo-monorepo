"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "./Primitives";

export function SignInButton() {
  return (
    <Button onClick={() => signIn("google", { redirect: false })}>
      Sign in with Google
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button className=" bg-red-600! text-white" onClick={() => signOut()}>
      Sign Out
    </Button>
  );
}
