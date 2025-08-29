import { ReactNode } from "react";

export const Button = ({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button
      className={`bg-white text-black font-semibold px-3 py-4 rounded-lg cursor-pointer hover:opacity-80 active:scale-98 transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
