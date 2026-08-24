import type { AssuranceBand as AssuranceBandT } from "@/lib/types";
import { bandPct } from "@/lib/band";

function Track({
  band,
  markerLeft,
  showTicks = true,
}: {
  band: AssuranceBandT;
  markerLeft: number;
  showTicks?: boolean;
}) {
  const histLeft = bandPct(band, band.historicalLow);
  const histWidth = bandPct(band, band.historicalHigh) - histLeft;
  const promLeft = bandPct(band, band.promisedLow);
  const promWidth = bandPct(band, band.promisedHigh) - promLeft;

  return (
    <div className="relative h-14 sm:h-16">
      <div className="absolute left-0 right-0 top-7 sm:top-8 h-px bg-stone-line" />
      <div
        className="hatch-corridor absolute top-4 sm:top-5 h-6"
        style={{ left: `${histLeft}%`, width: `${histWidth}%` }}
      />
      <div
        className="absolute top-5 sm:top-6 h-4 border-t border-b border-bronze-text"
        style={{ left: `${promLeft}%`, width: `${promWidth}%` }}
      />
      <div
        className="wedge-marker absolute top-2.5 sm:top-3 w-2.5 h-9 sm:h-10 bg-bronze-text transition-[left] duration-1000 ease-out"
        style={{ left: `${markerLeft}%` }}
      />
      {showTicks && (
        <>
          <span className="absolute top-0 left-0 font-data text-[10px] text-ink-faint tabnum">
            {band.scaleMin}
          </span>
          <span className="absolute top-0 right-0 font-data text-[10px] text-ink-faint tabnum">
            {band.scaleMax}
          </span>
        </>
      )}
    </div>
  );
}

function Legend({ band }: { band: AssuranceBandT }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-soft">
      <span className="flex items-center gap-1.5">
        <i className="hatch-corridor inline-block w-3 h-3" />
        Verified historical {band.historicalLow}–{band.historicalHigh} {band.unit}
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block w-3 h-3 border-t border-b border-bronze-text" />
        Promised band {band.promisedLow}–{band.promisedHigh} {band.unit}
      </span>
      <span className="flex items-center gap-1.5">
        <i className="wedge-marker inline-block w-2.5 h-3 bg-bronze-text" />
        Realized, {band.cycleLabel}
      </span>
    </div>
  );
}

/** Compact, static rendering for listing rows — no animation, no trigger. */
export function AssuranceBandCompact({ band }: { band: AssuranceBandT }) {
  const markerLeft = bandPct(band, band.realized);
  return (
    <div>
      <Track band={band} markerLeft={markerLeft} showTicks={false} />
      <div className="mt-2 flex items-center justify-between gap-3">
        <Legend band={band} />
        {band.status === "breach" && band.rebate && (
          <span className="shrink-0 font-data text-[11px] uppercase tracking-wider text-stamp border border-stamp/50 px-2 py-1">
            Rebate paid · {band.rebate.clause}
          </span>
        )}
      </div>
    </div>
  );
}

export { Track, Legend };
