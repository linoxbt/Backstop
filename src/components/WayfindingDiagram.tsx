import Link from "next/link";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";
import { POOL } from "@/lib/pool";

export function WayfindingDiagram() {
  return (
    <div className="relative max-w-2xl">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const count = agentsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.id}`}
              className="group border border-stone-line bg-stone-raised/50 hover:bg-stone-raised transition-colors p-4 sm:p-6 flex flex-col justify-between min-h-[132px] sm:min-h-[160px]"
            >
              <span className="font-data text-[10px] uppercase tracking-wider text-bronze-text">
                {cat.clause}
              </span>
              <div>
                <h3 className="font-display text-lg sm:text-xl leading-tight mb-1 group-hover:text-bronze-text transition-colors">
                  {cat.label}
                </h3>
                <p className="font-data text-[11px] text-ink-faint tabnum">
                  {count} agents live
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
        <Link
          href="/pool"
          className="pointer-events-auto relative w-[104px] h-[104px] rounded-full bg-stone border-2 border-bronze-text flex flex-col items-center justify-center text-center hover:border-bronze-bright transition-colors"
        >
          <span className="font-data text-[9px] uppercase tracking-wider text-ink-faint">
            Reserve
          </span>
          <span className="font-display text-sm text-ink mt-1">{POOL.tvl}</span>
        </Link>
      </div>

      <Link
        href="/pool"
        className="sm:hidden mt-3 flex items-center justify-between bg-stone-raised border border-bronze-text px-5 py-4 hover:border-bronze-bright transition-colors"
      >
        <span className="font-data text-[10px] uppercase tracking-wider text-ink-faint">
          Reserve
        </span>
        <span className="font-display text-base text-ink">{POOL.tvl}</span>
      </Link>
    </div>
  );
}
