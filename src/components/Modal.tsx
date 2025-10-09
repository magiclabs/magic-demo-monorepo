import React from "react";
import { Button } from "@/components/Primitives";

// Modal Component
interface ModalProps {
  isOpen: boolean;
  type: 'otp' | 'mfa' | 'recovery' | 'error' | 'success';
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
  type: 'otp' | 'mfa' | 'recovery';
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  errorMessage?: string;
}

const ModalInput = ({ type, value, onChange, onKeyDown, inputRef, errorMessage }: ModalInputProps) => {
  const placeholder = type === 'otp' ? 'Enter 6-digit OTP' :
                     type === 'mfa' ? 'Enter MFA code' :
                     'Enter recovery code';

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
            ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
            : 'border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent'
        }`}
        maxLength={type === 'otp' ? 6 : undefined}
      />
      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

const ModalIcon = ({ type }: { type: ModalProps['type'] }) => {
  const iconClass = "w-8 h-8";
  
  switch (type) {
    case 'otp':
      return (
        <svg className={`${iconClass} text-primary`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'mfa':
      return (
        <svg className={`${iconClass} text-secondary`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case 'recovery':
      return (
        <svg className={`${iconClass} text-warning`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'success':
      return (
        <svg className={`${iconClass} text-success`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className={`${iconClass} text-destructive`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
};

export const Modal = ({
  isOpen,
  type,
  title,
  message,
  errorMessage,
  onSubmit,
  onCancel,
  onClose
}: ModalProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const [localErrorMessage, setLocalErrorMessage] = React.useState<string | undefined>(errorMessage);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update local error message when prop changes
  React.useEffect(() => {
    setLocalErrorMessage(errorMessage);
  }, [errorMessage]);

  React.useEffect(() => {
    if (isOpen && (type === 'otp' || type === 'mfa' || type === 'recovery')) {
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
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-background border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ModalIcon type={type} />
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground">
          {message}
        </p>


        {/* Input Field */}
        {(type === 'otp' || type === 'mfa' || type === 'recovery') && (
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
          {type === 'success' || type === 'error' ? (
            <Button
              onClick={handleSubmit}
              variant={type === 'success' ? 'primary' : 'danger'}
              className="flex-1 min-w-0"
            >
              {type === 'success' ? 'Continue' : 'Close'}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                variant="secondary"
                className="flex-1 min-w-0"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                className="flex-1 min-w-0"
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
