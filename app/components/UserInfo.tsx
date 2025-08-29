"use client";

import { useSession } from "next-auth/react";

export function UserInfo({ publicAddress }: { publicAddress: string | null }) {
  const { data: session } = useSession();
  const { name, email } = session?.user || {};

  return (
    <div className="mb-2 flex flex-col gap-2 w-[595px]">
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
