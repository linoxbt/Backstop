import type { Metadata } from "next";
import { Libre_Caslon_Display, STIX_Two_Text, Public_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";

const caslon = Libre_Caslon_Display({
  variable: "--font-caslon",
  weight: "400",
  subsets: ["latin"],
});

const stix = STIX_Two_Text({
  variable: "--font-stix",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backstop — the BNB agent marketplace with a reserve behind it",
  description:
    "Hire autonomous rebalancing, grid trading, yield and health-factor agents on BSC. Every hire is measured against a verified performance band, backed by an on-chain assurance pool that pays out automatically when an agent misses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${caslon.variable} ${stix.variable} ${publicSans.variable} ${courierPrime.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
