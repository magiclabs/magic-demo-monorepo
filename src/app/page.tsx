import Link from "next/link";

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
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative py-4">
            <h1 className="text-6xl font-bold gradient-text mb-4 leading-tight">
              Choose Wallet Type
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-3xl blur-2xl opacity-40 scale-110"></div>
          </div>
          <p className="text-muted-foreground text-xl">
            Select the type of wallet you&apos;d like to use
          </p>
        </div>

        {/* Wallet Selection Buttons */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <Link
            href="/api-wallet"
            className="group relative font-semibold inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 glow-primary"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.5 5H9a2 2 0 0 0-2 2v2c0 1-.6 3-3 3 1 0 3 .6 3 3v2a2 2 0 0 0 2 2h.5m5-14h.5a2 2 0 0 1 2 2v2c0 1 .6 3 3 3-1 0-3 .6-3 3v2a2 2 0 0 1-2 2h-.5"
              />
            </svg>
            Express API Wallet
          </Link>

          <Link
            href="/embedded-wallet"
            className="group relative font-semibold inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-accent text-white rounded-xl hover:from-secondary-dark hover:to-secondary transition-all duration-300 glow-secondary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 640 640"
            >
              <path d="M152 96C103.4 96 64 135.4 64 184L64 424C64 472.6 103.4 512 152 512L488 512C536.6 512 576 472.6 576 424L576 280C576 231.4 536.6 192 488 192L184 192C170.7 192 160 202.7 160 216C160 229.3 170.7 240 184 240L488 240C510.1 240 528 257.9 528 280L528 424C528 446.1 510.1 464 488 464L152 464C129.9 464 112 446.1 112 424L112 184C112 161.9 129.9 144 152 144L520 144C533.3 144 544 133.3 544 120C544 106.7 533.3 96 520 96L152 96zM448 384C465.7 384 480 369.7 480 352C480 334.3 465.7 320 448 320C430.3 320 416 334.3 416 352C416 369.7 430.3 384 448 384z" />
            </svg>
            Embedded Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}
