import type { Metadata } from "next";
import { Forum } from "next/font/google";
import { WalletProviders } from "@/components/WalletProviders";
import "./globals.css";

// The reference (momentolegal.com) uses exactly two type families: Forum
// for its big editorial headings, and bare system-font stacks (no custom
// webfont at all) for everything else — confirmed directly from its own
// shipped CSS (`--font-sans`/`--font-mono` are plain `ui-sans-serif`/
// `ui-monospace` stacks). Backstop now matches that exactly instead of
// using Space Grotesk/Outfit/DM Mono — see the --font-display/--font-body/
// --font-ui/--font-data definitions in globals.css.
const forum = Forum({
  variable: "--font-forum-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backstop: the BNB agent marketplace with a reserve behind it",
  description:
    "Hire autonomous rebalancing, grid trading, yield and health-factor agents on BSC. Every hire is measured against a verified performance band, backed by an onchain assurance pool that pays out automatically when an agent misses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${forum.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
