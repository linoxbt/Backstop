"use client";

import Link from "next/link";
import { getAgent } from "@/lib/agents";
import { useInView } from "@/lib/useInView";
import { useScrollDepth } from "@/lib/useScrollDepth";
import { DarkBandBar } from "./DarkBandBar";

/**
 * The reference's art-directed "About" section, reimplemented with a real
 * subject: Meridian Rebalancer's actual promised-vs-realized band — the
 * same hatch-corridor/wedge-marker primitives from AssuranceBand.tsx, at
 * monumental scale, not a stock photo or invented illustration. Desktop and
 * mobile get genuinely different compositions, not one reflowed layout.
 *
 * The heading gets a genuine scroll-linked depth-of-field: it fades/sharpens
 * in once via the one-shot `useInView` reveal below, then `.scroll-depth-blur`
 * takes over as the user keeps scrolling past the section — a continuous
 * blur, not another one-shot trigger (see useScrollDepth.ts / globals.css).
 */
export function GuaranteeReveal() {
  const agent = getAgent("meridian-rebalancer")!;
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const { ref: headingDepthRef } = useScrollDepth<HTMLHeadingElement>();
  const { ref: headingDepthRefMobile } = useScrollDepth<HTMLHeadingElement>();

  return (
    <section
      ref={ref}
      data-tone="dark"
      className="relative w-full min-h-[100dvh] overflow-hidden bg-[var(--color-momento-bg-deep)] flex flex-col justify-center py-20 md:py-0"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(80%_60%_at_85%_50%,_var(--color-momento-blue)_0%,_transparent_70%)] opacity-60"
        aria-hidden="true"
      />
      {/* Desktop: headline layered over a large right-hand visual */}
      <div className="hidden md:block relative z-10 w-full h-[100dvh]">
        <div className="absolute top-[16%] left-[clamp(1.6rem,3.5vw,13rem)] z-10 max-w-md">
          <span className="font-ui text-[0.75vw] uppercase tracking-[0.36em] text-white/40 block mb-4">
            Clause 0
          </span>
          <h2
            ref={headingDepthRef}
            className={`scroll-depth-blur font-forum uppercase text-white text-[4.1667vw] leading-[0.85] tracking-[0.02em] ${
              inView ? "animate-momento-reveal" : "opacity-0"
            }`}
          >
            What stands
            <br />
            behind every
            <br />
            hire
          </h2>
          <p
            className={`font-body text-[0.95vw] text-white/60 mt-8 max-w-sm leading-relaxed ${
              inView ? "animate-momento-reveal" : "opacity-0"
            }`}
            style={{ animationDelay: inView ? "150ms" : undefined }}
          >
            Every agent&rsquo;s fee funds the assurance pool. Miss the promised band, and it pays
            a capped rebate automatically — no dispute, no claim form.
          </p>
          <Link
            href="/pool"
            className={`inline-block mt-8 font-data text-xs uppercase tracking-[0.2em] text-white/70 border-b border-white/30 hover:text-white hover:border-white pb-1 transition-colors ${
              inView ? "animate-momento-reveal" : "opacity-0"
            }`}
            style={{ animationDelay: inView ? "300ms" : undefined }}
          >
            See the reserve →
          </Link>
        </div>

        <div
          className={`absolute right-[clamp(1.6rem,3.5vw,13rem)] top-1/2 -translate-y-1/2 w-[48vw] z-20 ${
            inView ? "animate-momento-reveal" : "opacity-0"
          }`}
          style={{ animationDelay: inView ? "250ms" : undefined }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-ui text-sm text-white">{agent.name}</span>
            <span className="font-data text-[11px] text-white/40 tabnum">
              {agent.band.cycleLabel}
            </span>
          </div>
          <DarkBandBar band={agent.band} />
        </div>
      </div>

      {/* Mobile: stacked, simplified composition — not the same DOM reflowed */}
      <div className="md:hidden relative z-10 px-6">
        <span className="font-ui text-[11px] uppercase tracking-[0.32em] text-white/40 block mb-4">
          Clause 0
        </span>
        <h2
          ref={headingDepthRefMobile}
          className={`scroll-depth-blur font-forum uppercase text-white text-[34px] leading-[1.05] tracking-[0.02em] mb-6 ${
            inView ? "animate-momento-reveal" : "opacity-0"
          }`}
        >
          What stands behind every hire
        </h2>
        <p className="font-body text-[15px] text-white/60 leading-relaxed mb-8 max-w-sm">
          Every agent&rsquo;s fee funds the assurance pool. Miss the promised band, and it pays a
          capped rebate automatically.
        </p>
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-ui text-sm text-white">{agent.name}</span>
          <span className="font-data text-[11px] text-white/40 tabnum">
            {agent.band.cycleLabel}
          </span>
        </div>
        <DarkBandBar band={agent.band} />
        <Link
          href="/pool"
          className="inline-block mt-8 font-data text-xs uppercase tracking-[0.2em] text-white/70 border-b border-white/30"
        >
          See the reserve →
        </Link>
      </div>
    </section>
  );
}
