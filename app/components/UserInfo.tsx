"use client";

import { useSession } from "next-auth/react";

export function UserInfo({ publicAddress }: { publicAddress: string | null }) {
  const { data: session } = useSession();
  const { name, email } = session?.user || {};

  return (
    <div className="p-4 flex flex-col gap-2 w-[627px] bg-[rgb(36,36,38)] rounded-lg shadow-[0_4px_24px_0_rgba(0,0,0,0.4)]">
      {name && (
        <h2 className="text-lg">
          <b>Name:</b> {name}
        </h2>
      )}
      {email && (
        <h2 className="text-lg">
          <b>Email:</b> {email}
        </h2>
      )}
      <h2 className="text-lg">
        <b>Public Address:</b>{" "}
        <span className="font-mono">{publicAddress ?? "Loading..."}</span>
      </h2>
    </div>
  );
}
