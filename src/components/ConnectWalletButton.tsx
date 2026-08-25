"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { projectId } from "@/lib/wallet/config";

const buttonClass =
  "font-data text-[11px] uppercase tracking-wider border px-3 py-2 transition-colors";

export function ConnectWalletButton() {
  if (!projectId) {
    return (
      <button
        type="button"
        disabled
        title="Wallet connect not configured — set NEXT_PUBLIC_REOWN_PROJECT_ID (get one free at dashboard.reown.com)"
        className={`${buttonClass} border-stone-line text-ink-faint cursor-not-allowed`}
      >
        Connect wallet
      </button>
    );
  }
  return <ConnectedButton />;
}

function ConnectedButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  return (
    <button
      type="button"
      onClick={() => open()}
      className={`${buttonClass} border-ink text-ink hover:bg-ink hover:text-stone`}
    >
      {isConnected && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connect wallet"}
    </button>
  );
}
