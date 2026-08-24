import Link from "next/link";
import { CATEGORIES, agentsByCategory } from "@/lib/agents";
import { POOL } from "@/lib/pool";

const LINE_ANGLES = [45, 135, 225, 315];

export function WayfindingDiagram() {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const count = agentsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`#${cat.id}`}
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
        {LINE_ANGLES.map((deg) => (
          <div
            key={deg}
            className="absolute bg-bronze/60"
            style={{
              left: "50%",
              top: "50%",
              width: 44,
              height: 1,
              transformOrigin: "0% 50%",
              transform: `rotate(${deg}deg)`,
            }}
          />
        ))}
        <Link
          href="/pool"
          className="pointer-events-auto relative w-[104px] h-[104px] rounded-full bg-steel border border-bronze flex flex-col items-center justify-center text-center hover:border-bronze-bright transition-colors"
        >
          <span className="font-data text-[9px] uppercase tracking-wider text-paper-on-steel/60">
            Reserve
          </span>
          <span className="font-display text-sm text-paper-on-steel mt-1">{POOL.tvl}</span>
        </Link>
      </div>
    </div>
  );
}
