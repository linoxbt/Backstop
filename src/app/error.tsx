"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-20 sm:py-32">
        <span className="font-data text-xs uppercase tracking-wider text-stamp">
          Something broke
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-3 mb-6">
          This page hit an error.
        </h1>
        <p className="font-body text-paper-ink-soft leading-relaxed mb-2">
          Nothing on-chain was affected — this is a rendering failure, not a lost transaction.
        </p>
        {error.digest && (
          <p className="font-data text-[11px] text-paper-ink-faint mb-8">Error digest: {error.digest}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="font-data text-xs uppercase tracking-wider px-5 py-3 rounded-lg bg-paper-ink text-paper hover:bg-bronze-text transition-colors"
          >
            Try again →
          </button>
          <Link
            href="/"
            className="font-data text-xs uppercase tracking-wider px-5 py-3 border border-paper-ink text-paper-ink hover:bg-paper-ink hover:text-paper transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
