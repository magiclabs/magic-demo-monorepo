"use client";

interface WalletAddressProps {
  address: string | null;
  isLoading?: boolean;
  className?: string;
}

export const WalletAddress = ({
  address,
  isLoading = false,
  className = "",
}: WalletAddressProps) => {
  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-white/10 ${className}`}
    >
      <div className="w-8 h-8 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <span className="font-mono text-sm text-white break-all">
        {address ?? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            Loading wallet...
          </div>
        )}
      </span>
      {address && (
        <button
          onClick={handleCopy}
          className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer active:scale-95"
          title="Copy address"
        >
          <svg
            className="w-4 h-4 text-muted-foreground hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
