import { Button } from "./Button";
import { OAuthModalState } from "./embedded-wallet/auth/OAuthAuth";
import { providerConfigs } from "./embedded-wallet/auth/OAuthProvidersConfig";

interface Props {
  modalState: OAuthModalState;
  setModalState: (modalState: OAuthModalState) => void;
  onSubmit: (provider: string, method: "redirect" | "popup") => void;
  onClose?: () => void;
}

export function OAuthProvidersModal({
  modalState,
  setModalState,
  onSubmit,
  onClose,
}: Props) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setModalState({ ...modalState, isOpen: false });
  };

  const handleProviderClick = (provider: string) => {
    const method = modalState.method;

    // reset the modal state
    setModalState({
      ...modalState,
      method: null,
      isOpen: false,
    });

    // call the callback
    onSubmit(provider, method ?? "redirect");
  };

  if (!modalState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-1 border border-slate-4 rounded-3xl shadow-2xl p-6 space-y-10">
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
            <h3 className="text-2xl font-bold ">Social Login</h3>
            <p className="text-sm text-secondary text-center">
              Select a social provider to login with.
            </p>
          </div>
        </div>

        {/* Providers */}
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto scrollbar pr-1">
          {Object.values(providerConfigs).map((provider) => {
            if (
              provider.name === "telegram" &&
              modalState.method === "redirect"
            )
              return null;
            return (
              <div key={provider.name}>
                <Button
                  onClick={() => handleProviderClick(provider.name)}
                  fullWidth
                  className="flex items-center justify-center gap-2"
                >
                  <provider.logo />
                  <p className="text-md text-muted-foreground">
                    Sign in with {provider.title}
                  </p>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
