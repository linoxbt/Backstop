"use client";

import Image from "next/image";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";
import type { AgentCategory } from "@/lib/types";
import { CategorySeal } from "./CategorySeal";
import { useInView } from "@/lib/useInView";

/**
 * One real, properly-licensed (Unsplash License — free commercial use, no
 * attribution required) photo per category, chosen for what the category
 * actually does rather than anything literal about "law" or "finance" in
 * the abstract: a security net for the agent that manages grid orders (the
 * literal meaning of "backstop" — a net that catches), precision clockwork
 * for the agent that resets a drifting range, a bank's safe-deposit
 * drawers for value routing, and a red ink stamp for the same rebate-stamp
 * visual already used elsewhere in this app (AssuranceBandInteractive.tsx).
 */
const CATEGORY_IMAGE: Record<AgentCategory, { src: string; alt: string }> = {
  rebalancing: {
    // Photo by Isis França on Unsplash — https://unsplash.com/photos/hsPFuudRg5I
    src: "https://images.unsplash.com/photo-1524514587686-e2909d726e9b",
    alt: "",
  },
  "grid-trading": {
    // Photo by Lerone Pieters on Unsplash — https://unsplash.com/photos/bareXZyt-7Q
    src: "https://images.unsplash.com/photo-1546229738-ed21fb6e3158",
    alt: "",
  },
  yield: {
    // Photo by Jason Pofahl on Unsplash — https://unsplash.com/photos/zLtXrNXJpKM
    src: "https://images.unsplash.com/photo-1565126111587-f9fb04a432e4",
    alt: "",
  },
  "health-factor": {
    // Photo by Valeria Reverdo on Unsplash — https://unsplash.com/photos/rKluCY7dPN4
    src: "https://images.unsplash.com/photo-1648994605501-fe0a391d2653",
    alt: "",
  },
};

function ShowcaseItem({ category, raised }: { category: (typeof CATEGORIES)[number]; raised: boolean }) {
  const agents = agentsByCategory(category.id);
  const flagship = [...agents].sort((a, b) => b.hirers - a.hirers)[0];
  const image = CATEGORY_IMAGE[category.id];
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center transition-opacity ${
        raised ? "md:-mt-10" : "md:mt-10"
      } ${inView ? "animate-fade-rise" : "opacity-0"}`}
    >
      <div className="relative mb-6 shrink-0" style={{ width: 168, height: 168 }}>
        <div className="absolute inset-3 rounded-full overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="168px"
            className="object-cover grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-[var(--color-momento-blue)] mix-blend-multiply opacity-60" />
          <div className="absolute inset-0 bg-[var(--color-momento-bg)] opacity-20" />
        </div>
        {flagship && (
          <div className="absolute inset-0">
            <CategorySeal band={flagship.band} size={168} />
          </div>
        )}
      </div>
      <h3 className="font-forum text-2xl text-white mb-2">{category.label}</h3>
      <p className="font-body text-[13px] text-white/55 leading-relaxed max-w-[24ch]">
        {category.blurb}
      </p>
    </div>
  );
}

/**
 * Replaces WayfindingDiagram's landing-page slot — the reference's
 * "Expertise" section reworked around Backstop's own four real categories
 * and real domain term ("ASSURANCE", not a literal clone of the
 * reference's word) instead of nine invented practice areas.
 */
export function CategoryShowcase() {
  return (
    <section
      data-tone="dark"
      className="relative w-full overflow-hidden bg-[var(--color-momento-bg)] py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
      >
        <span
          className="font-display text-[24vw] leading-none whitespace-nowrap text-transparent opacity-50"
          style={{ WebkitTextStroke: "1px var(--color-momento-line)" }}
        >
          ASSURANCE
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16 sm:mb-24">
          <span className="font-data text-xs uppercase tracking-[0.3em] text-white/40 block mb-3">
            The four territories
          </span>
          <h2 className="font-forum text-white text-4xl sm:text-5xl">What&rsquo;s underwritten</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-6">
          {CATEGORIES.map((c, i) => (
            <ShowcaseItem key={c.id} category={c} raised={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
