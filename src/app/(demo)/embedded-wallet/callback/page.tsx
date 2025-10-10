"use client";

import { LogMethod, LogType, useConsole } from "@/contexts/ConsoleContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { OAuthRedirectResult } from "@magic-ext/oauth2";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const { logToConsole } = useConsole();

  useEffect(() => {
    logToConsole(
      LogType.INFO,
      LogMethod.MAGIC_OAUTH_LOGIN_WITH_REDIRECT,
      "Getting redirect result..."
    );

    MagicService.magic.oauth2
      .getRedirectResult()
      .then((result: OAuthRedirectResult) => {
        logToConsole(
          LogType.SUCCESS,
          LogMethod.MAGIC_OAUTH_LOGIN_WITH_REDIRECT,
          "Login with redirect successful",
          result
        );

        router.push("/embedded-wallet/wallet");
      })
      .catch((error: unknown) => {
        const errorMsg =
          (error as Error).message || "Failed to get redirect result";
        logToConsole(
          LogType.ERROR,
          LogMethod.MAGIC_OAUTH_LOGIN_WITH_REDIRECT,
          errorMsg,
          { error }
        );
        router.push("/embedded-wallet");
      });
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Getting redirect result...</p>
      </div>
    </div>
  );
}
