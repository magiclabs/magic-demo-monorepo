"use client";

import Link from "next/link";
import iconEmbedded from "public/icons/icon-embedded.svg";
import iconExpress from "public/icons/icon-express.svg";
import Image from "next/image";

interface ProductButtonProps {
  variant: "embedded" | "express";
}

const productMap = {
  embedded: {
    href: "/embedded-wallet",
    label: "Embedded Wallet",
    icon: iconEmbedded,
    highlightColor: "#7D51FF",
  },
  express: {
    href: "/api-wallet",
    label: "Express API Wallet",
    icon: iconExpress,
    highlightColor: "#90F0D3",
  },
};

const getColorWithOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
};

export const ProductButton = ({ variant }: ProductButtonProps) => {
  const { href, label, icon, highlightColor } = productMap[variant];
  const highlight = getColorWithOpacity(highlightColor, 0.4);
  const highlightHover = getColorWithOpacity(highlightColor, 0.6);
  const highlightActive = getColorWithOpacity(highlightColor, 0.8);

  return (
    <Link
      href={href}
      className="w-[313px] h-[264px] flex flex-col items-center justify-center gap-10 border-2 border-white/70 rounded-3xl transition-all duration-300 ease-out hover:scale-105 hover:border-white/90 active:scale-98 group"
      style={{
        background:
          "radial-gradient(52.4% 104.17% at 49.84% 0%, rgba(58, 58, 58, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)",
        boxShadow: `5.299px -2.65px 37.267px 0 ${highlight}, 0 -6.591px 19.773px 0 rgba(255, 255, 255, 0.80) inset, 0 -32.955px 61.516px 0 ${highlight} inset`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `5.299px -2.65px 50px 0 ${highlightHover}, 0 -6.591px 19.773px 0 rgba(255, 255, 255, 0.90) inset, 0 -32.955px 61.516px 0 ${highlightHover} inset`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `5.299px -2.65px 37.267px 0 ${highlight}, 0 -6.591px 19.773px 0 rgba(255, 255, 255, 0.80) inset, 0 -32.955px 61.516px 0 ${highlight} inset`;
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = `5.299px -2.65px 60px 0 ${highlightActive}, 0 -6.591px 19.773px 0 rgba(255, 255, 255, 0.95) inset, 0 -32.955px 61.516px 0 ${highlightActive} inset`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = `5.299px -2.65px 50px 0 ${highlightHover}, 0 -6.591px 19.773px 0 rgba(255, 255, 255, 0.90) inset, 0 -32.955px 61.516px 0 ${highlightHover} inset`;
      }}
    >
      <Image src={icon} alt={label} width={24} height={24} />
      <span className="text-[19px] text-secondary font-jetbrains text-center uppercase">
        {label}
      </span>
    </Link>
  );
};
