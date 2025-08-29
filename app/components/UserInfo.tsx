"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { teeService } from "../lib/tee-service";

export function UserInfo() {
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet && status === "authenticated") {
      teeService.getOrCreateWallet().then((address) => {
        setWallet(address);
      });
    }
  }, [wallet, status]);

  if (!session) return <div>Not signed in</div>;

  return (
    <div className="mb-2">
      Signed in as {session.user?.email || session.user?.name}
      {wallet && <div>Wallet: {wallet}</div>}
    </div>
  );
}
