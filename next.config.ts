import type { NextConfig } from "next";

// @wagmi/connectors' Base Account connector pulls in @base-org/account ->
// Coinbase's CDP SDK -> an x402 payment module tree we don't use and isn't
// fully published in a way Turbopack can statically resolve. We don't need
// the Base Account / Coinbase Smart Wallet connector for a BSC-only app, so
// cut the whole subtree off at its root instead of chasing individual
// unresolvable leaf packages.
const emptyModule = "./src/lib/empty-module.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@base-org/account": emptyModule,
    },
  },
  images: {
    // Real, properly-licensed (Unsplash License — free commercial use, no
    // attribution required) photography for the landing page's category
    // showcase — see CategorySeal.tsx/CategoryShowcase.tsx.
    remotePatterns: [{ hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: this app opens a real wallet-signature flow, so a
          // page that could be framed is a real phishing vector, not just
          // theory.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            // Deliberately not a hardened script-src/connect-src allowlist:
            // Reown AppKit/WalletConnect talks to a broad, versioned set of
            // relay/analytics endpoints that isn't practical to enumerate
            // by hand here without risking silently breaking the wallet
            // connect flow. frame-ancestors is the real, load-bearing
            // clause (belt-and-suspenders with X-Frame-Options above,
            // since CSP is the modern replacement for it); the rest is a
            // baseline that still blocks unrelated object/base-uri
            // injection without touching what the app actually needs to
            // load.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self' https: wss:",
              "frame-src https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
