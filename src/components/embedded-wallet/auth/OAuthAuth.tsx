"use client";

import { Button } from "@/components/Button";
import { OAuthProvidersModal } from "@/components/OAuthProvidersModal";
import { LogMethod, LogType, useConsole } from "@/contexts/ConsoleContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import iconRedirect from "public/icons/icon-external.svg";
import iconPopup from "public/icons/icon-chat.svg";

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
      <h3 className="text-sm font-semibold text-secondary">OAuth</h3>

      <Button
        onClick={handleRedirectLoginClicked}
        variant="secondary"
        fullWidth
        className="flex items-center justify-between gap-2"
      >
        Login with Redirect
        <Image src={iconRedirect} alt="Redirect" width={24} height={24} />
      </Button>

      <Button
        onClick={handlePopupLoginClicked}
        variant="secondary"
        fullWidth
        className="flex items-center justify-between gap-2"
      >
        Login with Popup
        <Image src={iconPopup} alt="Popup" width={24} height={24} />
      </Button>

      <OAuthProvidersModal
        modalState={modalState}
        setModalState={setModalState}
        onSubmit={handleOAuthLogin}
      />
    </div>
  );
}
