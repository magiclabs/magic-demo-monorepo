"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagicService } from "../../lib/get-magic";
import { Button } from "../Primitives";
import { useConsole, LogType, LogMethod } from "../../contexts/ConsoleContext";
import {
  DeviceVerificationEventOnReceived,
  LoginWithEmailOTPEventEmit,
  LoginWithEmailOTPEventOnReceived,
} from "magic-sdk";

interface EmailOTPAuthProps {
  onSuccess?: () => void;
}

export function EmailOTPAuth({ onSuccess }: EmailOTPAuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logToConsole } = useConsole();
  const router = useRouter();

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
        "Sending OTP via whitelabel Magic API...",
        { email, showUI: false }
      );

      const deviceCheckUI = false;

      const handle = MagicService.magic.auth.loginWithEmailOTP({
        email,
        showUI: false,
        deviceCheckUI,
      });

      logToConsole(
        LogType.SUCCESS,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
        `OTP sent successfully to ${email} (Whitelabel)`,
        { email }
      );

      if (!deviceCheckUI) {
        handle.on(DeviceVerificationEventOnReceived.DeviceNeedsApproval, () => {
          window.alert("Device Needs Approval, Check your Email Inbox");
        });
        handle.on(
          DeviceVerificationEventOnReceived.DeviceVerificationEmailSent,
          () => {
            window.alert("Device Verification Email Sent");
          }
        );
        handle.on(DeviceVerificationEventOnReceived.DeviceApproved, () => {
          window.alert("Device has been approved");
        });
        handle.on(
          DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired,
          () => {
            window.alert("Device Verification link Expired");
          }
        );
      }

      handle.on(LoginWithEmailOTPEventOnReceived.EmailOTPSent, () => {
        const otp = window.prompt("Enter Email OTP");
        handle.emit(LoginWithEmailOTPEventEmit.VerifyEmailOtp, otp as never);
      });
      handle.on(LoginWithEmailOTPEventOnReceived.MfaSentHandle, () => {
        const otp = window.prompt("Please enter the MFA code!");
        handle.emit(LoginWithEmailOTPEventEmit.VerifyMFACode, otp as never);
      });

      // MFA Recovery Code
      let retriesRecoveryMFA = 2;
      handle.on(LoginWithEmailOTPEventOnReceived.RecoveryCodeSentHandle, () => {
        const otp = window.prompt(`Input MFA Recovery`);
        handle.emit(
          LoginWithEmailOTPEventEmit.VerifyRecoveryCode,
          otp as string
        );
      });
      handle.on(LoginWithEmailOTPEventOnReceived.InvalidRecoveryCode, () => {
        if (!retriesRecoveryMFA) {
          handle.emit(LoginWithEmailOTPEventEmit.Cancel);
        } else {
          const otp = window.prompt(
            `Invalid code, Please enter OTP again. Retries left: ${retriesRecoveryMFA}`
          );
          retriesRecoveryMFA--;
          handle.emit(
            LoginWithEmailOTPEventEmit.VerifyRecoveryCode,
            otp as never
          );
        }
      });

      // MFA
      let retriesMFA = 2;
      handle.on(LoginWithEmailOTPEventOnReceived.InvalidMfaOtp, () => {
        if (!retriesMFA) {
          handle.emit(LoginWithEmailOTPEventEmit.LostDevice);
        } else {
          const otp = window.prompt(
            `Invalid MFA code, Please enter MFA code again. Retries left: ${retriesMFA}`
          );
          retriesMFA--;
          handle.emit(LoginWithEmailOTPEventEmit.VerifyMFACode, otp as string);
        }
      });

      // Email OTP
      let retries = 2;
      handle.on(LoginWithEmailOTPEventOnReceived.InvalidEmailOtp, () => {
        if (!retries) {
          handle.emit(LoginWithEmailOTPEventEmit.Cancel);
        } else {
          const otp = window.prompt(
            `Invalid code, Please enter OTP again. Retries left: ${retries}`
          );
          retries--;
          handle.emit(LoginWithEmailOTPEventEmit.VerifyEmailOtp, otp as never);
        }
      });

      handle.on("error", (error: unknown) => {
        alert(`Error: ${error}`);
      });
      handle.on("done", () => {
        alert("Login complete!");
      });

      const didToken = await handle;
      logToConsole(
        LogType.SUCCESS,
        LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
        "Whitelabel login completed",
        { email, didToken }
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
        {/* <Button
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
        </Button> */}
      </div>
    </div>
  );
}
