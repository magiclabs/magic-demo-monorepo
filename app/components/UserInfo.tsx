"use client";

import { useEffect, useState } from "react";
import { teeFetch } from "../lib/tee-client";
import { TeeEndpoint } from "../lib/tee-types";
import { useSession } from "next-auth/react";

export function UserInfo() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<string | null>(null);

  console.log(session);

  useEffect(() => {
    if (!wallet && session?.idToken) {
      teeFetch(TeeEndpoint.WALLET, session.idToken).then((res) => {
        console.log("RES", res);
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
