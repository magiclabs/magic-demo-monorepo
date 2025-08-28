"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  return (
    <>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => signIn("google")}
      >
        Sign in with Google
      </button>
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 ml-2"
        onClick={() => signIn("github")}
      >
        Sign in with GitHub
      </button>
    </>
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

export function UserInfo() {
  const { data: session } = useSession();
  if (!session) return <div>Not signed in</div>;
  return (
    <div className="mb-2">
      Signed in as {session.user?.email || session.user?.name}
    </div>
  );
}
