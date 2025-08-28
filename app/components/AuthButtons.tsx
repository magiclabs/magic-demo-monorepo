"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => signIn("google", { redirect: false })}
    >
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  );
}
