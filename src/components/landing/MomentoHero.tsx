"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Full-viewport hero, reproducing the reference's composition: centered,
 * uppercase, extreme letter-spacing, fluid vw sizing, non-interactive
 * display text that fades in shortly after mount. Backstop's own
 * already-restrained UI sans (Outfit) stands in for the reference's bare
 * system-font choice — swapping to a literal OS default would be a
 * foreign typeface against the rest of the site, not a restrained one.
 */
export function MomentoHero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      data-tone="dark"
      className="relative w-full h-[100dvh] overflow-hidden bg-[var(--color-momento-bg)] flex flex-col"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_0%,_var(--color-momento-glow)_0%,_var(--color-momento-bg-deep)_45%,_var(--color-momento-bg)_100%)] opacity-90"
        aria-hidden="true"
      />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-28 sm:pt-32 md:pt-[9vw] px-6 text-center">
        <span
          className={`font-ui text-[11px] md:text-[0.85vw] uppercase tracking-[0.36em] text-white/40 mb-6 transition-opacity duration-700 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          BNB Agent Studio Marketplace
        </span>
        <h1
          className={`uppercase text-white font-ui font-normal cursor-default select-none text-[30px] leading-[1.15] tracking-[0.14em] md:text-[3.125vw] md:leading-[1.1] md:tracking-[0.18em] max-w-4xl transition-opacity duration-1000 delay-150 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          Hire an agent.
          <br />
          If it misses, the pool pays you back.
        </h1>
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-4 transition-opacity duration-700 delay-500 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link
            href="/marketplace"
            className="font-data text-xs uppercase tracking-[0.2em] px-6 py-3 border border-white/40 text-white hover:bg-bronze-bright hover:text-[var(--color-momento-bg)] hover:border-bronze-bright transition-colors"
          >
            Enter the marketplace
          </Link>
          <Link
            href="/docs"
            className="font-data text-xs uppercase tracking-[0.2em] px-6 py-3 text-white/50 hover:text-white transition-colors"
          >
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}
