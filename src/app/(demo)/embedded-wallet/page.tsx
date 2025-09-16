"use client";
import { EmailOTPAuth } from "../../../components/embedded-wallet/EmailOTPAuth";
import { OAuthAuth } from "../../../components/embedded-wallet/OAuthAuth";

export default function Home() {

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
        <div
          className="floating-orb absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-2xl"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-xl"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        {/* Top Right Docs Button */}
        <div className="absolute top-8 right-8 z-20">
          <a
            href="https://magic.link/docs"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 glow-primary"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View Magic Docs
          </a>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <h1 className="text-6xl font-bold gradient-text mb-4">
              Magic Embedded Wallets
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg blur opacity-20"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Get Started</h2>
            <p className="text-muted-foreground mb-8">
              Connect your account using Magic's embedded wallet authentication
            </p>
          </div>

          {/* Email OTP Authentication */}
          <EmailOTPAuth />

          {/* OAuth Authentication */}
          <OAuthAuth />
        </div>
      </div>
    </div>
  );
}
