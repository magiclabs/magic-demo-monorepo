import {
  LogoApple,
  LogoBitBucket,
  LogoDiscord,
  LogoFacebook,
  LogoGitHub,
  LogoGitLab,
  LogoGoogle,
  LogoLinkedIn,
  LogoMicrosoft,
  LogoTelegram,
  LogoTwitch,
  LogoTwitter,
} from "@/components/Logos";

interface OAuthProvidersConfig {
  [key: string]: {
    logo: React.FC<React.SVGProps<SVGSVGElement>>;
    name: string;
    title: string;
  };
}

export const providerConfigs: OAuthProvidersConfig = {
  google: {
    logo: LogoGoogle,
    name: "google",
    title: "Google",
  },
  github: {
    logo: LogoGitHub,
    name: "github",
    title: "GitHub",
  },
  facebook: {
    logo: LogoFacebook,
    name: "facebook",
    title: "Facebook",
  },
  apple: {
    logo: LogoApple,
    name: "apple",
    title: "Apple",
  },
  linkedin: {
    logo: LogoLinkedIn,
    name: "linkedin",
    title: "LinkedIn",
  },
  bitbucket: {
    logo: LogoBitBucket,
    name: "bitbucket",
    title: "Bitbucket",
  },
  gitlab: {
    logo: LogoGitLab,
    name: "gitlab",
    title: "GitLab",
  },
  twitter: {
    logo: LogoTwitter,
    name: "twitter",
    title: "X (Twitter)",
  },
  discord: {
    logo: LogoDiscord,
    name: "discord",
    title: "Discord",
  },
  twitch: {
    logo: LogoTwitch,
    name: "twitch",
    title: "Twitch",
  },
  microsoft: {
    logo: LogoMicrosoft,
    name: "microsoft",
    title: "Microsoft",
  },
  telegram: {
    logo: LogoTelegram,
    name: "telegram",
    title: "Telegram",
  },
};
