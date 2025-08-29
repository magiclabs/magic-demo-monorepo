"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function UserInfo() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet && session) {
      fetch("/api/tee/wallet")
        .then((res) => res.json())
        .then((data) => {
          console.log("RES", data);
        });
    }
  }, [wallet, session]);

  if (!session) return <div>Not signed in</div>;
  return (
    <div className="mb-2">
      Signed in as {session.user?.email || session.user?.name}
    </div>
  );
}
