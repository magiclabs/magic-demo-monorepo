"use client";

import logoMagic from "public/logos/logo-magic.svg";
import Image from "next/image";
import { Button } from "./Button";
import logoGithub from "public/logos/logo-github.svg";
import iconDoc from "public/icons/icon-doc.svg";
import iconExpress from "public/icons/icon-cube.svg";
import iconEmbedded from "public/icons/icon-wallet.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const Header = () => {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isEmbeddedWalletRoute =
    isHydrated && pathname?.startsWith("/embedded-wallet");
  const isApiWalletRoute = isHydrated && pathname?.startsWith("/api-wallet");

  // Dynamic docs configuration based on pathname
  const getDocsConfig = () => {
    if (isEmbeddedWalletRoute) {
      return {
        text: "View Embedded Docs",
        url: "https://docs.magic.link/embedded-wallets/introduction",
      };
    }
    if (isApiWalletRoute) {
      return {
        text: "View Express Docs",
        url: "https://docs.magic.link/api-wallets/express-api/overview",
      };
    }
    // Default Magic docs
    return {
      text: "View Magic Docs",
      url: "https://docs.magic.link/",
    };
  };

  const docsConfig = getDocsConfig();

  return (
    <div className="px-10 py-6 flex flex-col lg:flex-row items-center justify-between gap-6">
      <div
        style={{
          background:
            "radial-gradient(50% 50% at 50% 5%, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.00) 100%)",
          height: 300,
          width: "50vw",
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.55,
        }}
      />
      <a href="https://magic.link" target="_blank" className="flex-shrink-0">
        <Image src={logoMagic} alt="Magic" width={199} height={40} />
      </a>

      <div className="flex flex-col md:flex-row items-center gap-4 z-10">
        {isApiWalletRoute && (
          <Link
            href="/embedded-wallet"
            className="flex-shrink-0 w-full md:w-auto"
          >
            <Button variant="secondary" onClick={() => {}} fullWidth glow>
              <div className="flex items-center gap-2">
                <Image
                  src={iconEmbedded}
                  alt="Embedded Wallet"
                  width={24}
                  height={24}
                />
                Try Embedded Wallet
              </div>
            </Button>
          </Link>
        )}
        {isEmbeddedWalletRoute && (
          <Link href="/api-wallet" className="flex-shrink-0 w-full md:w-auto">
            <Button variant="secondary" onClick={() => {}} fullWidth glow>
              <div className="flex items-center gap-2">
                <Image
                  src={iconExpress}
                  alt="Express API Wallet"
                  width={24}
                  height={24}
                />
                Try API Wallet
              </div>
            </Button>
          </Link>
        )}
        <a
          href="https://github.com/magiclabs/magic-demo-monorepo"
          target="_blank"
          className="flex-shrink-0 w-full md:w-auto"
        >
          <Button variant="secondary" onClick={() => {}} fullWidth glow>
            <div className="flex items-center gap-2">
              <Image src={logoGithub} alt="GitHub" width={24} height={24} />
              View GitHub
            </div>
          </Button>
        </a>
        <a
          href={docsConfig.url}
          target="_blank"
          className="flex-shrink-0 w-full md:w-auto"
        >
          <Button variant="primary" onClick={() => {}} fullWidth glow>
            <div className="flex items-center gap-2">
              <Image
                src={iconDoc}
                alt={docsConfig.text}
                width={24}
                height={24}
              />
              {docsConfig.text}
            </div>
          </Button>
        </a>
      </div>
    </div>
  );
};
