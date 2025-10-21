import { useState, useCallback } from "react";
import { MagicService } from "@/lib/embedded-wallet/get-magic";
import { useConsole, LogType, LogMethod } from "@/contexts/ConsoleContext";
import {
  LoginWithEmailOTPEventEmit,
  LoginWithEmailOTPEventOnReceived,
} from "magic-sdk";

interface ModalState {
  isOpen: boolean;
  type: "otp" | "mfa" | "recovery" | "error" | "success";
  title: string;
  message: string;
  retries?: number;
  maxRetries?: number;
  // errorMessage?: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
}

export function useEmailOTPModal() {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "otp",
    title: "",
    message: "",
  });
  const { logToConsole } = useConsole();

  // Modal helper functions
  const openModal = useCallback((state: Omit<ModalState, "isOpen">) => {
    setModalState({ ...state, isOpen: true });
  }, []);

  const closeModal = useCallback(() => {
    setIsLoading(false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleWhitelabelEmailOTPLogin = useCallback(
    async (
      email: string,
      onSuccess: () => void,
      onError?: (error: string) => void
    ) => {
      if (!email) {
        const errorMsg = "Please enter an email address";
        logToConsole(
          LogType.ERROR,
          LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
          errorMsg
        );
        onError?.(errorMsg);
        return;
      }

      try {
        logToConsole(
          LogType.INFO,
          LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
          "Sending OTP via whitelabel Magic API...",
          { email, showUI: false }
        );

        const handle = MagicService.magic.auth.loginWithEmailOTP({
          email,
          showUI: false,
        });

        logToConsole(
          LogType.SUCCESS,
          LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
          `OTP sent successfully to ${email} (Whitelabel)`,
          { email }
        );

        // Email OTP
        let retries = 2;
        handle.on(LoginWithEmailOTPEventOnReceived.EmailOTPSent, () => {
          openModal({
            type: "otp",
            title: "Enter Email OTP",
            message: `Enter the code sent to ${email}`,
            retries: retries,
            maxRetries: 2,
            onSubmit: (otp) => {
              setIsLoading(true);
              handle.emit(
                LoginWithEmailOTPEventEmit.VerifyEmailOtp,
                otp as never
              );
            },
            onCancel: () => {
              handle.emit(LoginWithEmailOTPEventEmit.Cancel);
            },
          });
        });

        handle.on(LoginWithEmailOTPEventOnReceived.InvalidEmailOtp, () => {
          setIsLoading(false);

          if (!retries) {
            handle.emit(LoginWithEmailOTPEventEmit.Cancel);
          } else {
            // Update the existing modal with error message instead of opening a new one
            setInputValue("");
            setErrorMessage(
              `Invalid code, please enter OTP again. Retries left: ${retries}`
            );

            setModalState((prev) => ({
              ...prev,
              retries: retries,
              onSubmit: (otp: string) => {
                setIsLoading(true);
                retries--;
                handle.emit(
                  LoginWithEmailOTPEventEmit.VerifyEmailOtp,
                  otp as never
                );
              },
            }));
          }
        });

        // MFA
        let retriesMFA = 2;
        handle.on(LoginWithEmailOTPEventOnReceived.MfaSentHandle, () => {
          setInputValue("");
          setIsLoading(false);

          openModal({
            type: "mfa",
            title: "Enter MFA Code",
            message: "Please enter the MFA code from your authenticator app",
            retries: retriesMFA,
            maxRetries: 2,
            onSubmit: (mfa) => {
              setIsLoading(true);
              handle.emit(
                LoginWithEmailOTPEventEmit.VerifyMFACode,
                mfa as never
              );
            },
            onCancel: () => {
              handle.emit(LoginWithEmailOTPEventEmit.Cancel);
            },
          });
        });

        handle.on(LoginWithEmailOTPEventOnReceived.InvalidMfaOtp, () => {
          setIsLoading(false);
          setInputValue("");

          if (!retriesMFA) {
            handle.emit(LoginWithEmailOTPEventEmit.LostDevice);
          } else {
            setErrorMessage(
              `Invalid MFA code, please enter MFA code again. Retries left: ${retriesMFA}`
            );
            // Update the existing modal with error message instead of opening a new one
            setModalState((prev) => ({
              ...prev,
              retries: retriesMFA,
              onSubmit: (mfa: string) => {
                setIsLoading(true);
                retriesMFA--;
                handle.emit(
                  LoginWithEmailOTPEventEmit.VerifyMFACode,
                  mfa as string
                );
              },
            }));
          }
        });

        // MFA Recovery Code
        let retriesRecoveryMFA = 2;
        handle.on(
          LoginWithEmailOTPEventOnReceived.RecoveryCodeSentHandle,
          () => {
            setInputValue("");
            setIsLoading(false);

            openModal({
              type: "recovery",
              title: "Enter Recovery Code",
              message: "Please enter your MFA recovery code",
              retries: retriesRecoveryMFA,
              maxRetries: 2,
              onSubmit: (recovery) => {
                setIsLoading(true);
                handle.emit(
                  LoginWithEmailOTPEventEmit.VerifyRecoveryCode,
                  recovery as string
                );
              },
              onCancel: () => {
                handle.emit(LoginWithEmailOTPEventEmit.Cancel);
              },
            });
          }
        );

        handle.on(LoginWithEmailOTPEventOnReceived.InvalidRecoveryCode, () => {
          setInputValue("");
          setIsLoading(false);

          if (!retriesRecoveryMFA) {
            handle.emit(LoginWithEmailOTPEventEmit.Cancel);
          } else {
            setErrorMessage(
              `Invalid recovery code, please enter recovery code again. Retries left: ${retriesRecoveryMFA}`
            );
            // Update the existing modal with error message instead of opening a new one
            setModalState((prev) => ({
              ...prev,
              retries: retriesRecoveryMFA,
              onSubmit: (recovery: string) => {
                setIsLoading(true);

                retriesRecoveryMFA--;
                handle.emit(
                  LoginWithEmailOTPEventEmit.VerifyRecoveryCode,
                  recovery as never
                );
              },
            }));
          }
        });

        handle.on("error", (error: unknown) => {
          const errorMsg = `Error: ${error}`;
          setIsLoading(false);

          openModal({
            type: "error",
            title: "Authentication Error",
            message: errorMsg,
            onSubmit: () => closeModal(),
            onCancel: () => closeModal(),
          });
          onError?.(errorMsg);
        });

        handle.on("done", () => {
          setIsLoading(false);
          openModal({
            type: "success",
            title: "Login Complete!",
            message: "Authentication successful. Redirecting to wallet...",
            onSubmit: () => {
              closeModal();
              onSuccess();
            },
            onCancel: () => {
              closeModal();
              onSuccess();
            },
          });
        });

        const didToken = await handle;
        logToConsole(
          LogType.SUCCESS,
          LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
          "Whitelabel login completed",
          { email, didToken }
        );

        onSuccess();
      } catch (error: unknown) {
        const errorMsg = (error as Error).message || "Failed to send OTP";
        logToConsole(
          LogType.ERROR,
          LogMethod.MAGIC_AUTH_LOGIN_WITH_EMAIL_OTP,
          errorMsg,
          { email, error }
        );
        openModal({
          type: "error",
          title: "Login Failed",
          message: errorMsg,
          onSubmit: () => closeModal(),
          onCancel: () => closeModal(),
        });
        onError?.(errorMsg);
      }
    },
    [logToConsole, openModal, closeModal]
  );

  return {
    modalState,
    inputValue,
    setInputValue,
    errorMessage,
    setErrorMessage,
    isLoading,
    handleWhitelabelEmailOTPLogin,
    closeModal,
  };
}
