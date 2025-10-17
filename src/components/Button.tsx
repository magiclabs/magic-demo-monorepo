import { getColorWithOpacity } from "@/utils/opacity-converter";
import { cn } from "@/utils/tailwind";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  glow?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const variants = {
  primary: {
    buttonClassName: "bg-white text-[#18171A]",
    gradientColor: "#ffffff",
    glowColor: "-2px -2px 4px 0 rgba(255, 255, 255, 0.25)",
  },
  secondary: {
    buttonClassName: "bg-[#383838] text-white",
    gradientColor: "#F8F8FA",
    glowColor: "0 0 40px 0 rgba(255, 255, 255, 0.16)",
  },
};
export const Button = ({
  children,
  onClick,
  variant = "primary",
  className,
  disabled = false,
  glow,
  fullWidth = false,
}: ButtonProps) => {
  const { buttonClassName, gradientColor, glowColor } = variants[variant];
  const primaryVariant = variant === "primary";

  return (
    <div
      className={cn(
        "p-px rounded-2xl h-fit w-fit overflow-auto hover:opacity-85 active:scale-95 transition-all duration-200 ease-out whitespace-nowrap",
        fullWidth && "w-full",
        disabled && "opacity-60 pointer-events-none"
      )}
      style={{
        ...(glow && {
          boxShadow: glowColor,
        }),
        background: `linear-gradient(180deg, ${getColorWithOpacity(
          gradientColor,
          0.6
        )}, ${getColorWithOpacity(gradientColor, 0.15)})`,
      }}
    >
      <button
        className={cn(
          "px-6 py-3 rounded-2xl font-semibold cursor-pointer w-fit",
          buttonClassName,
          className,
          fullWidth && "w-full"
        )}
        style={{
          ...(primaryVariant && {
            background:
              "linear-gradient(180deg, #DDDBE0 0%, #F8F8FA 100%), #FFF",
          }),
        }}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
};
