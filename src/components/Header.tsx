"use client";

import logoMagic from "public/logos/logo-magic.svg";
import Image from "next/image";
import { Button } from "./Button";
import logoGithub from "public/logos/logo-github.svg";
import iconDoc from "public/icons/icon-doc.svg";

export const Header = () => {
  return (
    <div className="px-10 py-6 flex items-center justify-between">
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

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/magiclabs/magic-demo-monorepo"
          target="_blank"
          className="flex-shrink-0"
        >
          <Button variant="secondary" onClick={() => {}} glow>
            <div className="flex items-center gap-2">
              <Image src={logoGithub} alt="GitHub" width={24} height={24} />
              View GitHub
            </div>
          </Button>
        </a>
        <a
          href="https://docs.magic.link/"
          target="_blank"
          className="flex-shrink-0"
        >
          <Button variant="primary" onClick={() => {}} glow>
            <div className="flex items-center gap-2">
              <Image src={iconDoc} alt="Magic Docs" width={24} height={24} />
              View Magic Docs
            </div>
          </Button>
        </a>
      </div>
    </div>
  );
};
