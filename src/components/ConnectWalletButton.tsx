"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { projectId } from "@/lib/wallet/config";

const buttonClass =
  "font-data text-[11px] uppercase tracking-wider border rounded-lg px-3 py-2 transition-colors";

export function ConnectWalletButton({ dark = false }: { dark?: boolean }) {
  if (!projectId) {
    return (
      <button
        type="button"
        disabled
        title="Wallet connect not configured — set NEXT_PUBLIC_REOWN_PROJECT_ID (get one free at dashboard.reown.com)"
        className={`${buttonClass} cursor-not-allowed ${
          dark ? "border-white/20 text-white/40" : "border-paper-line text-paper-ink-faint"
        }`}
      >
        Connect wallet
      </button>
    );
  }
  return <ConnectedButton dark={dark} />;
}

function ConnectedButton({ dark }: { dark: boolean }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  return (
    <button
      type="button"
      onClick={() => open()}
      className={`${buttonClass} ${
        dark
          ? "border-white/40 text-white hover:bg-bronze-bright hover:text-[var(--color-momento-bg)]"
          : "border-paper-ink text-paper-ink hover:bg-bronze-bright hover:text-paper hover:border-bronze-bright"
      }`}
    >
      {isConnected && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connect wallet"}
    </button>
  );
}
