"use client";

import { useSession } from "next-auth/react";

export function UserInfo({ publicAddress }: { publicAddress: string | null }) {
  const { data: session } = useSession();

  return (
    <div className="mb-2 flex flex-col gap-2">
      <h2 className="text-lg font-bold">
        Signed in as {session?.user?.email || session?.user?.name}
      </h2>
      <h2 className="text-lg font-bold">
        Wallet: {publicAddress ?? "Loading..."}
      </h2>
    </div>
  );
}
