"use client";

import Image from "next/image";
import iconCopy from "public/icons/icon-copy.svg";
interface WalletAddressProps {
  address: string | null;
  className?: string;
}

export const WalletAddress = ({
  address,
  className = "",
}: WalletAddressProps) => {
  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-secondary tracking-wide">
        Wallet Address
      </label>
      <div
        className={`flex items-center gap-2 p-4 bg-background rounded-xl border border-slate-4 ${className}`}
      >
        <span className="font-mono text-lg text-white break-all md:truncate">
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
            className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer active:scale-95 flex-shrink-0"
            title="Copy address"
          >
            <Image src={iconCopy} alt="Copy" width={24} height={24} />
          </button>
        )}
      </div>
    </div>
  );
};
