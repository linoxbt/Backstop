"use client";

import Link from "next/link";
import { AGENTS, CATEGORIES } from "@/lib/agents";
import { useScrollSequence } from "@/lib/useScrollSequence";
import { DarkBandBar } from "./DarkBandBar";

function SequencePanel({
  agent,
  index,
  total,
  setPanelRef,
}: {
  agent: (typeof AGENTS)[number];
  index: number;
  total: number;
  setPanelRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={setPanelRef}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-0"
    >
      <span className="font-data text-xs uppercase tracking-[0.3em] text-bronze-bright block mb-3">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span className="font-data text-[11px] uppercase tracking-[0.2em] text-white/40 block mb-4">
        {CATEGORIES.find((c) => c.id === agent.category)?.label}
      </span>
      <Link
        href={`/agents/${agent.id}`}
        className="group font-forum text-3xl sm:text-4xl text-white mb-6 hover:text-bronze-bright transition-colors"
      >
        {agent.name}
      </Link>
      <div className="w-full max-w-md mb-6">
        <DarkBandBar band={agent.band} size="compact" />
      </div>
      <span className="font-data text-[11px] text-white/40 tabnum">
        {agent.hirers} hirers · {agent.cyclesCompleted} cycles
      </span>
    </div>
  );
}

/**
 * Moves the same way as CategoryShowcase's Territories sequence — one card
 * fully visible at a time in a sticky-pinned scroll sequence — via the same
 * useScrollSequence hook, rather than the horizontal-rail cascade this
 * previously used.
 */
export function AgentRail() {
  const featured = [...AGENTS].sort((a, b) => b.hirers - a.hirers).slice(0, 8);
  const { wrapperRef, panelRefs } = useScrollSequence<HTMLDivElement>(featured.length);

  return (
    <section data-tone="dark" className="relative w-full bg-[var(--color-momento-bg)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-10 text-center">
        <span className="font-ui text-[11px] md:text-[0.75vw] uppercase tracking-[0.36em] text-white/40 block mb-3">
          The catalog
        </span>
        <h2 className="font-forum uppercase text-white text-[28px] md:text-[2.5vw] leading-tight tracking-[0.02em]">
          Every hire, measured
        </h2>
      </div>

      <div
        ref={wrapperRef}
        className="relative"
        style={{ height: `${featured.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          {featured.map((agent, i) => (
            <SequencePanel
              key={agent.id}
              agent={agent}
              index={i}
              total={featured.length}
              setPanelRef={(el) => {
                panelRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
