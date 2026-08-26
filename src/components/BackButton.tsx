"use client";

import { useRouter } from "next/navigation";

/**
 * A real browser-history back, not a Link to a fixed parent route -- the
 * discovered-agents list this sits behind carries client-only state (tab,
 * search, page offset) that a fresh navigation to /marketplace would reset.
 * router.back() returns to exactly where the visitor left off.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.back()} className={className}>
      ← Back
    </button>
  );
}
