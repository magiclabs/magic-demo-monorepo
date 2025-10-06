"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "@/lib/get-magic";
import { Button } from "@/components/Primitives";
import { Modal } from "@/components/Modal";
import { useConsole, LogType, LogMethod } from "@/contexts/ConsoleContext";
import { useEmailOTPModal } from "@/hooks/useEmailOTPModal";

interface EmailOTPAuthProps {
  onSuccess?: () => void;
}

export function EmailOTPAuth({ onSuccess }: EmailOTPAuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logToConsole } = useConsole();
  const router = useRouter();
  const { modalState, handleWhitelabelEmailOTPLogin: whitelabelLogin, closeModal } = useEmailOTPModal();

  // Load persisted email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('magic_login_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Persist email to localStorage whenever it changes
  useEffect(() => {
    if (email) {
      localStorage.setItem('magic_login_email', email);
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
        logToConsole(LogType.ERROR, LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP, error);
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-center text-foreground">
        Email OTP Authentication
      </h3>
      <div className="w-full">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-foreground placeholder-muted-foreground"
          disabled={isLoading}
        />
      </div>

      {/* Email OTP Buttons - Horizontal Layout */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Regular Email OTP */}
        <Button
          onClick={handleEmailOTPLogin}
          variant="primary"
          className="flex-1 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex flex-col items-center justify-center gap-1">
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
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Regular OTP</span>
            <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
              showUI: true
            </span>
          </div>
        </Button>

        {/* Whitelabel Email OTP */}
        <Button
          onClick={handleWhitelabelEmailOTPLogin}
          variant="success"
          className="flex-1 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-emerald-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex flex-col items-center justify-center gap-1">
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
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Whitelabel OTP</span>
            <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
              showUI: false
            </span>
          </div>
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
