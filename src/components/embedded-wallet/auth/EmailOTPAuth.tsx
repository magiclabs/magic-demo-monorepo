"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { Modal } from "@/components/Modal";
import { useConsole, LogType, LogMethod } from "@/contexts/ConsoleContext";
import { useEmailOTPModal } from "@/hooks/useEmailOTPModal";
import { Button } from "@/components/Button";

interface EmailOTPAuthProps {
  onSuccess?: () => void;
}

export function EmailOTPAuth({ onSuccess }: EmailOTPAuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logToConsole } = useConsole();
  const router = useRouter();
  const {
    modalState,
    handleWhitelabelEmailOTPLogin: whitelabelLogin,
    closeModal,
  } = useEmailOTPModal();

  // Load persisted email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("magic_login_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Persist email to localStorage whenever it changes
  useEffect(() => {
    if (email) {
      localStorage.setItem("magic_login_email", email);
    }
  }, [email]);

  const handleSuccess = () => {
    // Redirect to wallet page after successful authentication using Next router
    router.push("/embedded-wallet/wallet");
    // Call the optional onSuccess callback if provided
    onSuccess?.();
  };

  const handleEmailOTPLogin = async () => {
    if (!email) {
      logToConsole(
        LogType.ERROR,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
        "Please enter an email address"
      );
      return;
    }

    setIsLoading(true);

    try {
      logToConsole(
        LogType.INFO,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
        "Sending OTP via regular Magic UI...",
        { email, showUI: true }
      );
      await MagicService.magic.auth.loginWithEmailOTP({ email });
      logToConsole(
        LogType.SUCCESS,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
        `OTP sent successfully to ${email}`,
        { email }
      );
      handleSuccess();
    } catch (error: unknown) {
      const errorMsg = (error as Error).message || "Failed to send OTP";
      logToConsole(
        LogType.ERROR,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
        errorMsg,
        { email, error }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhitelabelEmailOTPLogin = async () => {
    setIsLoading(true);
    try {
      await whitelabelLogin(email, handleSuccess, (error) => {
        logToConsole(
          LogType.ERROR,
          LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
          error
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-semibold text-secondary">
        Email OTP Authentication
      </h3>
      <div className="w-full">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 text-lg rounded-xl border bg-background border-slate-4 focus:ring-2 focus:ring-white/70 focus:border-transparent outline-none transition-all duration-200 text-foreground placeholder-muted-foreground"
          disabled={isLoading}
        />
      </div>

      {/* Email OTP Buttons - Horizontal Layout */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Regular Email OTP */}
        <Button
          onClick={handleEmailOTPLogin}
          variant="secondary"
          fullWidth
          className="flex flex-col gap-2"
        >
          <span>Regular OTP</span>
          <span className="font-jetbrains font-normal text-sm text-secondary">
            showUI: true
          </span>
        </Button>

        {/* Whitelabel Email OTP */}
        <Button
          onClick={handleWhitelabelEmailOTPLogin}
          variant="secondary"
          fullWidth
          className="flex flex-col gap-2"
        >
          <span>Whitelabel OTP</span>
          <span className="font-jetbrains font-normal text-sm text-secondary">
            showUI: false
          </span>
        </Button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        retries={modalState.retries}
        maxRetries={modalState.maxRetries}
        errorMessage={modalState.errorMessage}
        onSubmit={modalState.onSubmit}
        onCancel={modalState.onCancel}
        onClose={closeModal}
      />
    </div>
  );
}
