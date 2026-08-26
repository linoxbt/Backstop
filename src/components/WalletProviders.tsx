"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, wagmiConfig, networks, projectId, appKitMetadata } from "@/lib/wallet/config";

if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: appKitMetadata,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#6b4f31",
      "--w3m-border-radius-master": "0px",
      "--w3m-font-family": "var(--font-outfit), sans-serif",
    },
    features: { analytics: false, email: false, socials: [] },
  });
}

export function WalletProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
