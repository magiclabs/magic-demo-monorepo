"use client";

import magicLogo from "public/images/magic-logo.svg";
import Image from "next/image";
import { Button } from "./Button";
import logoGithub from "public/logos/logo-github.svg";
import iconDoc from "public/icons/icon-doc.svg";

export const Header = () => {
  return (
    <div className="px-10 py-6 flex items-center justify-between">
      <a href="https://magic.link" target="_blank">
        <Image src={magicLogo} alt="Magic" width={350} height={52} />
      </a>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/magiclabs/magic-demo-monorepo"
          target="_blank"
        >
          <Button variant="secondary" onClick={() => {}} glow>
            <div className="flex items-center gap-2">
              <Image src={logoGithub} alt="GitHub" width={24} height={24} />
              View GitHub
            </div>
          </Button>
        </a>
        <a href="https://docs.magic.link/" target="_blank">
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
