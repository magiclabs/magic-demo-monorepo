import React from "react";
import { Button } from "./Button";

// Modal Component
interface ModalProps {
  isOpen: boolean;
  type: "otp" | "mfa" | "recovery" | "error" | "success";
  title: string;
  message: string;
  retries?: number;
  maxRetries?: number;
  errorMessage?: string;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

interface ModalInputProps {
  type: "otp" | "mfa" | "recovery";
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  errorMessage?: string;
}

const ModalInput = ({
  type,
  value,
  onChange,
  onKeyDown,
  inputRef,
  errorMessage,
}: ModalInputProps) => {
  const placeholder =
    type === "otp"
      ? "Enter 6-digit OTP"
      : type === "mfa"
      ? "Enter MFA code"
      : "Enter recovery code";

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={`w-full px-4 py-3 rounded-xl glass border outline-none transition-all duration-200 text-foreground placeholder-muted-foreground ${
          errorMessage
            ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            : "border-white/10 focus:ring-2 focus:ring-white/70 focus:border-transparent"
        }`}
        maxLength={type === "otp" ? 6 : undefined}
      />
      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export const Modal = ({
  isOpen,
  type,
  title,
  message,
  errorMessage,
  onSubmit,
  onCancel,
  onClose,
}: ModalProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const [localErrorMessage, setLocalErrorMessage] = React.useState<
    string | undefined
  >(errorMessage);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update local error message when prop changes
  React.useEffect(() => {
    setLocalErrorMessage(errorMessage);
  }, [errorMessage]);

  React.useEffect(() => {
    if (isOpen && (type === "otp" || type === "mfa" || type === "recovery")) {
      // Focus on input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, type]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Clear error message when user starts typing
    if (localErrorMessage) {
      setLocalErrorMessage(undefined);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(inputValue);
      setInputValue("");
      setLocalErrorMessage(undefined);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setInputValue("");
    setLocalErrorMessage(undefined);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setInputValue("");
    setLocalErrorMessage(undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-1 border border-slate-4 rounded-3xl shadow-2xl p-6 space-y-6">
        {/* Header with Icon */}
        <div className="flex flex-col items-center justify-between gap-6">
          <div className="flex w-full justify-end">
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-[rgba(255,255,255,0.06)] hover:bg-white/10 active:bg-white/20 rounded-full p-2"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm text-secondary text-center">{message}</p>
          </div>
        </div>

        {/* Input Field */}
        {(type === "otp" || type === "mfa" || type === "recovery") && (
          <ModalInput
            type={type}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            inputRef={inputRef}
            errorMessage={localErrorMessage}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {type === "success" || type === "error" ? (
            <Button
              onClick={handleSubmit}
              variant={type === "success" ? "primary" : "danger"}
              className="flex-1 min-w-0"
            >
              {type === "success" ? "Continue" : "Close"}
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="secondary" fullWidth>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                fullWidth
                disabled={!inputValue}
              >
                Submit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
