"use client";

import Link from "next/link";
import { AGENTS, CATEGORIES } from "@/lib/agents";
import { useInView } from "@/lib/useInView";
import { DarkBandBar } from "./DarkBandBar";

/**
 * The reference's horizontally-scrolling "Insights" rail, reimplemented
 * with real agents instead of articles — each card is a real promised-vs-
 * realized band, linking to the real agent dossier page.
 */
export function AgentRail() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  const featured = [...AGENTS].sort((a, b) => b.hirers - a.hirers).slice(0, 8);

  return (
    <section
      ref={ref}
      data-tone="dark"
      className="relative w-full overflow-hidden bg-[var(--color-momento-bg)] py-20 md:py-[6vw]"
    >
      <div className="px-6 md:px-[clamp(1.6rem,3.5vw,13rem)] mb-10 md:mb-[3vw]">
        <span className="font-ui text-[11px] md:text-[0.75vw] uppercase tracking-[0.36em] text-white/40 block mb-3">
          The catalog
        </span>
        <h2
          className={`font-forum uppercase text-white text-[28px] md:text-[2.5vw] leading-tight tracking-[0.02em] ${
            inView ? "animate-momento-reveal" : "opacity-0"
          }`}
        >
          Every hire, measured
        </h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-[linear-gradient(270deg,_var(--color-momento-bg)_0%,_transparent_100%)] z-10" />
        <div className="flex gap-5 md:gap-[1.5vw] overflow-x-auto px-6 md:px-[clamp(1.6rem,3.5vw,13rem)] pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group shrink-0 w-[280px] md:w-[24vw] border border-[var(--color-momento-line)] bg-[var(--color-momento-surface)] p-6 hover:border-bronze-bright/60 transition-colors"
            >
              <span className="font-data text-[10px] uppercase tracking-[0.2em] text-white/40 block mb-1">
                {CATEGORIES.find((c) => c.id === agent.category)?.label}
              </span>
              <h3 className="font-ui text-lg text-white mb-4 group-hover:text-bronze-bright transition-colors">
                {agent.name}
              </h3>
              <DarkBandBar band={agent.band} size="compact" />
              <span className="font-data text-[11px] text-white/40 mt-4 block tabnum">
                {agent.hirers} hirers · {agent.cyclesCompleted} cycles
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
