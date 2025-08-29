import { ReactNode } from "react";
import { cn } from "../utils/tailwind";

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
      className={cn(
        "bg-white min-w-[200px] text-black font-semibold px-3 py-4 rounded-xl cursor-pointer hover:opacity-80 active:scale-98 transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
