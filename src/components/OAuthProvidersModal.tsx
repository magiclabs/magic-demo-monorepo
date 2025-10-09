import { OAuthModalState } from "./embedded-wallet/auth/OAuthAuth";
import { providerConfigs } from "./embedded-wallet/auth/OAuthProvidersConfig";

interface Props {
  modalState: OAuthModalState;
  setModalState: (modalState: OAuthModalState) => void;
  onSubmit: (provider: string, method: "redirect" | "popup") => void;
  onClose?: () => void;
}

const ModalIcon = () => {
  return (
    <svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      aria-labelledby="PasswordlessLogin"
    >
      <title id="PasswordlessLogin">Passwordless Login</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.18819 9C2.18819 5.13401 5.32219 2 9.18819 2C13.0542 2 16.1882 5.13401 16.1882 9C16.1882 9.33952 16.164 9.6734 16.1173 10H18.1333C18.1696 9.67167 18.1882 9.33801 18.1882 9C18.1882 4.02944 14.1587 0 9.18819 0C4.21762 0 0.188186 4.02944 0.188186 9C0.188186 10.3102 0.40637 11.4037 0.626662 12.1747C0.73319 12.5476 0.840765 12.847 0.925744 13.0614L0.0648335 15.9311C-0.257025 17.0039 0.667868 18.0383 1.7699 17.8379L5.09799 17.2328C5.1318 17.2447 5.16838 17.2575 5.20761 17.2709C5.44432 17.3521 5.77932 17.4592 6.18052 17.5662L6.18809 17.5683V15.4873C6.06049 15.4477 5.94888 15.4108 5.85626 15.3791C5.75606 15.3447 5.67862 15.3165 5.62778 15.2975C5.60238 15.288 5.58367 15.2809 5.57213 15.2764L5.56028 15.2718L5.55958 15.2715L5.55929 15.2714L5.55904 15.2713L5.55869 15.2712L5.55851 15.2711L5.29241 15.1647L5.0093 15.2161L2.21496 15.7242L2.94601 13.2873L3.05997 12.9075L2.88452 12.5566L2.88418 12.5559L2.88413 12.5558L2.88206 12.5515C2.87903 12.5451 2.87327 12.5329 2.86518 12.515C2.84899 12.4791 2.82348 12.4207 2.79166 12.3411C2.72797 12.1819 2.6394 11.9392 2.54971 11.6253C2.37 10.9963 2.18819 10.0898 2.18819 9ZM11.188 11C8.97885 11 7.18799 12.7909 7.18799 15V20C7.18799 22.2091 8.97885 24 11.188 24H20.188C22.3971 24 24.188 22.2091 24.188 20V15C24.188 12.7909 22.3971 11 20.188 11H11.188ZM10.0186 13.3773C10.3475 13.1399 10.7514 13 11.188 13H20.188C20.6246 13 21.0285 13.1399 21.3574 13.3773L16.2977 17.2693C15.9382 17.5458 15.4377 17.5458 15.0783 17.2693L10.0186 13.3773ZM9.18799 15.2616V20C9.18799 21.1046 10.0834 22 11.188 22H20.188C21.2926 22 22.188 21.1046 22.188 20V15.2616L17.5171 18.8546C16.4388 19.6841 14.9372 19.6841 13.8588 18.8546L9.18799 15.2616ZM6.18799 7C5.6357 7 5.18799 7.44772 5.18799 8C5.18799 8.55229 5.6357 9 6.18799 9H12.188C12.7403 9 13.188 8.55229 13.188 8C13.188 7.44772 12.7403 7 12.188 7H6.18799Z"
        fill="currentColor"
      />
    </svg>
  );
};

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
      <div className="relative w-full max-w-md bg-background border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ModalIcon />
            <h3 className="text-lg font-semibold text-foreground">
              Select Social Provider
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:bg-white/10 active:bg-white/20 rounded-xl p-2"
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

        {/* Message */}
        <p className="text-sm text-muted-foreground">
          Select a social provider to login with.
        </p>

        {/* Providers */}
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto scrollbar pr-1">
          {Object.values(providerConfigs).map((provider) => (
            <div
              key={provider.name}
              className="flex items-center gap-5 p-4 cursor-pointer hover:bg-white/10 active:bg-white/20 rounded-xl"
              onClick={() => handleProviderClick(provider.name)}
            >
              <provider.logo />
              <p className="text-md text-muted-foreground">{provider.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
