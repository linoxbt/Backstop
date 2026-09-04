"use client";

import Image from "next/image";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";
import { CategorySeal } from "./CategorySeal";
import { CATEGORY_IMAGE } from "@/lib/categoryImages";
import { useScrollSequence } from "@/lib/useScrollSequence";

function SequencePanel({
  category,
  index,
  setPanelRef,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
  setPanelRef: (el: HTMLDivElement | null) => void;
}) {
  const agents = agentsByCategory(category.id);
  const flagship = [...agents].sort((a, b) => b.hirers - a.hirers)[0];
  const image = CATEGORY_IMAGE[category.id];

  return (
    <div
      ref={setPanelRef}
      className="category-sequence-panel absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-0"
    >
      <div className="relative mb-8 shrink-0" style={{ width: 220, height: 220 }}>
        <div className="absolute inset-4 rounded-full overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="220px"
            className="object-cover grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-[var(--color-momento-glow)] mix-blend-multiply opacity-60" />
          <div className="absolute inset-0 bg-[var(--color-momento-bg)] opacity-20" />
        </div>
        {flagship && (
          <div className="absolute inset-0">
            <CategorySeal band={flagship.band} size={220} />
          </div>
        )}
      </div>
      <span className="font-data text-xs uppercase tracking-[0.3em] text-bronze-bright block mb-3">
        {String(index + 1).padStart(2, "0")} / {String(CATEGORIES.length).padStart(2, "0")}
      </span>
      <h3 className="font-forum text-3xl sm:text-4xl text-white mb-3">{category.label}</h3>
      <p className="font-body text-sm text-white/60 leading-relaxed max-w-md">{category.blurb}</p>
    </div>
  );
}

/**
 * Replaces WayfindingDiagram's landing-page slot — the reference's own
 * practice-area section scrolls through one item at a time (Corporate Law
 * steps out, Mergers & Acquisitions steps in, and so on); this reproduces
 * that exact rhythm for Backstop's four real categories instead of nine
 * invented practice areas, via a sticky-pinned viewport inside a tall
 * wrapper (see globals.css's `.category-sequence-*` rules and
 * useScrollSequence.ts for the mechanism).
 */
export function CategoryShowcase() {
  const { wrapperRef, panelRefs } = useScrollSequence<HTMLDivElement>(CATEGORIES.length);

  return (
    <section data-tone="dark" className="relative w-full bg-[var(--color-momento-bg)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-10 text-center">
        <span className="font-data text-xs uppercase tracking-[0.3em] text-white/40 block mb-3">
          The four territories
        </span>
        <h2 className="font-forum text-white text-4xl sm:text-5xl">What&rsquo;s underwritten</h2>
      </div>

      <div
        ref={wrapperRef}
        className="relative category-sequence-wrapper"
        style={{ height: `${CATEGORIES.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
          >
            <span
              className="font-display text-[24vw] leading-none whitespace-nowrap text-transparent opacity-50"
              style={{ WebkitTextStroke: "1px var(--color-momento-line)" }}
            >
              BACKSTOP
            </span>
          </div>

          {CATEGORIES.map((c, i) => (
            <SequencePanel
              key={c.id}
              category={c}
              index={i}
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
