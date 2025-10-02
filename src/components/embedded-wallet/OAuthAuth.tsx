"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Primitives";
import { MagicService } from "../../lib/get-magic";
import { useConsole, LogType, LogMethod } from "../../contexts/ConsoleContext";

interface OAuthAuthProps {
  onSuccess?: () => void;
}

export function OAuthAuth({ onSuccess }: OAuthAuthProps) {
  const { logToConsole } = useConsole();
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to wallet page after successful authentication using Next router
    router.push('/embedded-wallet/wallet');
    // Call the optional onSuccess callback if provided
    onSuccess?.();
  };

  const handleRedirectLogin = async () => {
    try {
      logToConsole(LogType.INFO, LogMethod.MAGIC_AUTH_LOGIN_WITH_MAGIC_LINK, 'Initiating Magic Link redirect login...', { });
      await MagicService.magic.oauth.loginWithRedirect({
        redirectURI: `${window.location.origin}/embedded-wallet`,
      });
      logToConsole(LogType.SUCCESS, LogMethod.MAGIC_AUTH_LOGIN_WITH_MAGIC_LINK, 'Magic Link sent successfully', {  });
    } catch (error: unknown) {
      const errorMsg = (error as Error).message || "Failed to send magic link";
      logToConsole(LogType.ERROR, LogMethod.MAGIC_AUTH_LOGIN_WITH_MAGIC_LINK, errorMsg, { error });
    }
  };

  const handlePopupLogin = async () => {
    try {
      logToConsole(LogType.INFO, LogMethod.MAGIC_OAUTH_LOGIN_WITH_POPUP, 'Initiating OAuth popup login...', { showUI: true });
      await MagicService.magic.oauth.loginWithPopup({});
      
      logToConsole(LogType.SUCCESS, LogMethod.MAGIC_OAUTH_LOGIN_WITH_POPUP, 'OAuth popup login successful');
      handleSuccess();
    } catch (error: unknown) {
      const errorMsg = (error as Error).message || "Login failed";
      logToConsole(LogType.ERROR, LogMethod.MAGIC_OAUTH_LOGIN_WITH_POPUP, errorMsg, { error });
    }
  };
  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-center text-foreground">
        OAuth
      </h3>
      
      <Button
        onClick={handleRedirectLogin}
        variant="secondary"
        className="w-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Login with Redirect
      </Button>

      <Button
        onClick={handlePopupLogin}
        variant="success"
        className="w-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Login with Popup
      </Button>
    </div>
  );
}
