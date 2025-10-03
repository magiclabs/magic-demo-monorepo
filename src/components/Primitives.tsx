import { ReactNode } from "react";
import { cn } from "@/utils/tailwind";

export const Button = ({
  children,
  onClick,
  className,
  variant = "primary",
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
}) => {
  const baseClasses = disabled
    ? "min-w-[200px] font-semibold px-6 py-4 rounded-xl cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 opacity-50"
    : "min-w-[200px] font-semibold px-6 py-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-secondary text-white glow-primary hover:from-primary-dark hover:to-primary",
    secondary:
      "bg-gradient-to-r from-accent to-primary text-white glow-accent hover:from-accent/80 hover:to-primary/80",
    danger:
      "bg-gradient-to-r from-error to-red-600 text-white hover:from-red-600 hover:to-red-700",
    success:
      "bg-gradient-to-r from-success to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], className)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
