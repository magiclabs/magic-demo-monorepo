interface TeeDocsButtonProps {
  className?: string;
}

export function TeeDocsButton({
  className = "absolute top-8 right-8 z-20",
}: TeeDocsButtonProps) {
  const isFullWidth = className.includes("w-full");
  const linkClass = isFullWidth
    ? "inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 glow-primary font-semibold w-full"
    : "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 glow-primary font-semibold";

  return (
    <div className={className}>
      <a
        href="https://docs.magic.link/api-wallets/express-api/overview"
        target="_blank"
        className={linkClass}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        View TEE Express Docs
      </a>
    </div>
  );
}
