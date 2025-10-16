import { getColorWithOpacity } from "@/utils/opacity-converter";
import { cn } from "@/utils/tailwind";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  glow?: boolean;
  className?: string;
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
  glow,
}: ButtonProps) => {
  const { buttonClassName, gradientColor, glowColor } = variants[variant];
  const primaryVariant = variant === "primary";

  return (
    <div
      className="p-px rounded-2xl h-fit overflow-auto hover:opacity-85 active:scale-95 transition-all duration-200 ease-out whitespace-nowrap"
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
      <div
        className={cn(
          "px-6 py-3 rounded-2xl font-semibold cursor-pointer",
          buttonClassName,
          className
        )}
        style={{
          ...(primaryVariant && {
            background:
              "linear-gradient(180deg, #DDDBE0 0%, #F8F8FA 100%), #FFF",
          }),
        }}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
};
