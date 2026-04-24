"use client";

import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { LogMethod, LogType, useConsole } from "@/contexts/ConsoleContext";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PasskeyAuthProps {
  onSuccess?: () => void;
}

export function Passkey({ onSuccess }: PasskeyAuthProps) {
  const { logToConsole } = useConsole();
  const router = useRouter();

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const handleSuccess = () => {
    // Redirect to wallet page after successful authentication using Next router
    router.push("/embedded-wallet/wallet");
    // Call the optional onSuccess callback if provided
    onSuccess?.();
  };

  const login = async () => {
    setIsRegisterLoading(false);
    setIsLoginLoading(true);

    logToConsole(
      LogType.INFO,
      LogMethod.MAGIC_OAUTH_LOGIN_WITH_PASSKEY,
      "Initiating Passkey login...",
    );

    try {
      await MagicService.magic.webauthn.login();
    } catch (error) {
      console.error(error);

      setIsRegisterLoading(false);
      setIsLoginLoading(false);
    }

    logToConsole(
      LogType.SUCCESS,
      LogMethod.MAGIC_OAUTH_LOGIN_WITH_PASSKEY,
      "Passkey login successful",
    );
    handleSuccess();

    setIsRegisterLoading(false);
    setIsLoginLoading(false);
  };
  const register = async () => {
    setIsRegisterLoading(true);
    setIsLoginLoading(false);

    logToConsole(
      LogType.INFO,
      LogMethod.MAGIC_OAUTH_LOGIN_WITH_PASSKEY,
      "Initiating Passkey register...",
    );

    try {
      await MagicService.magic.webauthn.registerNewUser();
    } catch (error) {
      console.error(error);
      setIsRegisterLoading(false);
      setIsLoginLoading(false);
    }

    logToConsole(
      LogType.SUCCESS,
      LogMethod.MAGIC_OAUTH_LOGIN_WITH_PASSKEY,
      "Passkey register successful",
    );
    handleSuccess();

    setIsRegisterLoading(false);
    setIsLoginLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-5 max-w-[328px]">
      <h3 className="text-2xl font-bold my-6">Passkey Login</h3>

      <div className="w-full flex gap-4">
        <Button
          onClick={register}
          variant="secondary"
          fullWidth
          className="flex items-center justify-center gap-2"
          disabled={isRegisterLoading || isLoginLoading}
        >
          {isRegisterLoading && <Spinner size={6} />}
          Register
        </Button>

        <Button
          onClick={login}
          variant="secondary"
          fullWidth
          className="flex items-center2 justify-center gap-2"
          disabled={isRegisterLoading || isLoginLoading}
        >
          {isLoginLoading && <Spinner size={6} />}
          Login
        </Button>
      </div>
    </div>
  );
}
