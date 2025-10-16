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
          {children}
        </div>
      </body>
    </html>
  );
}
