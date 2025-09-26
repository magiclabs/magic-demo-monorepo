import Link from "next/link";

interface BackButtonProps {
  href?: string;
  className?: string;
}

export function BackButton({ href = "/", className = "" }: BackButtonProps) {
  // Check if className contains 'w-full' to determine if it should be full width
  const isFullWidth = className.includes("w-full");
  const containerClass = isFullWidth
    ? `${className}`
    : `absolute top-8 left-8 z-20 ${className}`;
  const linkClass = isFullWidth
    ? "inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 w-full"
    : "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300";

  return (
    <div className={containerClass}>
      <Link href={href} className={linkClass}>
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Link>
    </div>
  );
}
