import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demo | Magic",
  description: "Magic API Wallets and Embedded Wallets Demo",
  openGraph: {
    title: "Demo | Magic",
    description: "Magic API Wallets and Embedded Wallets Demo",
    type: "website",
    url: "https://demo.magic.link",
    images: ["https://assets.magiclabs.com/assets/og-img.png"],
  },
  twitter: {
    title: "Demo | Magic",
    description: "Magic API Wallets and Embedded Wallets Demo",
    images: ["https://assets.magiclabs.com/assets/og-img.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative min-h-screen max-[740px]:overflow-hidden">
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
          {children}
        </div>
      </body>
    </html>
  );
}
