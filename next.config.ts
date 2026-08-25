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
};

export default nextConfig;
