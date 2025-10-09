"use client";

import { OAuthProvidersModal } from "@/components/OAuthProvidersModal";
import { Button } from "@/components/Primitives";
import { LogMethod, LogType, useConsole } from "@/contexts/ConsoleContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OAuthAuthProps {
  onSuccess?: () => void;
}

export interface OAuthModalState {
  isOpen: boolean;
  method?: "redirect" | "popup" | null;
}

export function OAuthAuth({ onSuccess }: OAuthAuthProps) {
  const { logToConsole } = useConsole();
  const router = useRouter();

  const [modalState, setModalState] = useState<OAuthModalState>({
    isOpen: false,
  });

  const handleSuccess = () => {
    // Redirect to wallet page after successful authentication using Next router
    router.push("/embedded-wallet/wallet");
    // Call the optional onSuccess callback if provided
    onSuccess?.();
  };

  const redirectLogin = async (provider: string) => {
    try {
      logToConsole(
        LogType.INFO,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_MAGIC_LINK,
        "Initiating Magic Link redirect login...",
        {}
      );

      await MagicService.magic.oauth2.loginWithRedirect({
        redirectURI: `${window.location.origin}/embedded-wallet/callback`,
        provider,
      });
      logToConsole(
        LogType.SUCCESS,
        LogMethod.MAGIC_OAUTH_LOGIN_WITH_REDIRECT,
        "Magic Link sent successfully",
        {}
      );
    } catch (error: unknown) {
      const errorMsg = (error as Error).message || "Failed to send magic link";
      logToConsole(
        LogType.ERROR,
        LogMethod.MAGIC_OAUTH_LOGIN_WITH_REDIRECT,
        errorMsg,
        { error }
      );
    }
  };

  const popupLogin = async (provider: string) => {
    try {
      logToConsole(
        LogType.INFO,
        LogMethod.MAGIC_OAUTH_LOGIN_WITH_POPUP,
        "Initiating OAuth popup login...",
        { showUI: true }
      );
      await MagicService.magic.oauth2.loginWithPopup({
        provider,
      });

      logToConsole(
        LogType.SUCCESS,
        LogMethod.MAGIC_OAUTH_LOGIN_WITH_POPUP,
        "OAuth popup login successful"
      );
      handleSuccess();
    } catch (error: unknown) {
      const errorMsg = (error as Error).message || "Login failed";
      logToConsole(
        LogType.ERROR,
        LogMethod.MAGIC_OAUTH_LOGIN_WITH_POPUP,
        errorMsg,
        { error }
      );
    }
  };

  const handleOAuthLogin = async (
    provider: string,
    method: "redirect" | "popup"
  ) => {
    if (method === "redirect") {
      await redirectLogin(provider);
    } else if (method === "popup") {
      await popupLogin(provider);
    }
  };

  // TODO: HANDLE ERRORS
  const handleRedirectLoginClicked = () => {
    setModalState({
      ...modalState,
      isOpen: true,
      method: "redirect",
    });
  };

  const handlePopupLoginClicked = () => {
    setModalState({
      ...modalState,
      isOpen: true,
      method: "popup",
    });
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-center text-foreground">
        OAuth
      </h3>

      <Button
        onClick={handleRedirectLoginClicked}
        variant="secondary"
        className="w-full"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        Login with Redirect
      </Button>

      <Button
        onClick={handlePopupLoginClicked}
        variant="success"
        className="w-full"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Login with Popup
      </Button>

      <OAuthProvidersModal
        modalState={modalState}
        setModalState={setModalState}
        onSubmit={handleOAuthLogin}
      />
    </div>
  );
}
