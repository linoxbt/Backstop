import type { AssuranceBand as AssuranceBandT } from "@/lib/types";
import { bandPct } from "@/lib/band";

function Track({
  band,
  markerLeft,
  showTicks = true,
  size = "default",
}: {
  band: AssuranceBandT;
  markerLeft: number | null;
  showTicks?: boolean;
  size?: "default" | "compact";
}) {
  const histLeft = bandPct(band, band.historicalLow);
  const histWidth = bandPct(band, band.historicalHigh) - histLeft;
  const promLeft = bandPct(band, band.promisedLow);
  const promWidth = bandPct(band, band.promisedHigh) - promLeft;
  const h = size === "compact" ? "h-9" : "h-14 sm:h-16";
  const railTop = size === "compact" ? "top-4" : "top-7 sm:top-8";
  const corridorTop = size === "compact" ? "top-2" : "top-4 sm:top-5";
  const promisedTop = size === "compact" ? "top-2.5" : "top-5 sm:top-6";
  const promisedH = size === "compact" ? "h-3" : "h-4";
  const markerTop = size === "compact" ? "top-1" : "top-2.5 sm:top-3";
  const markerH = size === "compact" ? "h-6" : "h-9 sm:h-10";

  return (
    <div className={`relative ${h}`}>
      <div className={`absolute left-0 right-0 ${railTop} h-px bg-stone-line`} />
      <div
        className={`hatch-corridor absolute ${corridorTop} h-6`}
        style={{ left: `${histLeft}%`, width: `${histWidth}%` }}
      />
      <div
        className={`absolute ${promisedTop} ${promisedH} border-t border-b border-bronze-text`}
        style={{ left: `${promLeft}%`, width: `${promWidth}%` }}
      />
      {markerLeft !== null && (
        <div
          className={`wedge-marker absolute ${markerTop} w-2.5 ${markerH} bg-bronze-text transition-[left] duration-1000 ease-out`}
          style={{ left: `${markerLeft}%` }}
        />
      )}
      {showTicks && (
        <>
          <span className="absolute top-0 left-0 font-data text-[10px] text-ink-faint tabnum">
            {band.scaleMin}
            {band.symbol}
          </span>
          <span className="absolute top-0 right-0 font-data text-[10px] text-ink-faint tabnum">
            {band.scaleMax}
            {band.symbol}
          </span>
        </>
      )}
    </div>
  );
}

function Legend({ band, compact = false }: { band: AssuranceBandT; compact?: boolean }) {
  const sep = compact ? " · " : null;
  const items = [
    <span key="hist" className="flex items-center gap-1.5">
      <i className="hatch-corridor inline-block w-3 h-3 shrink-0" />
      Verified {band.historicalLow}
      {band.symbol}–{band.historicalHigh}
      {band.symbol} {band.unit}
    </span>,
    <span key="prom" className="flex items-center gap-1.5">
      <i className="inline-block w-3 h-3 shrink-0 border-t border-b border-bronze-text" />
      Promised {band.promisedLow}
      {band.symbol}–{band.promisedHigh}
      {band.symbol} {band.unit}
    </span>,
    band.status === "pending" ? (
      <span key="live" className="flex items-center gap-1.5 text-ink-faint">
        <i className="inline-block w-3 h-3 shrink-0 rounded-full border border-ink-faint border-dashed" />
        Awaiting first cycle
      </span>
    ) : (
      <span key="live" className="flex items-center gap-1.5">
        <i className="wedge-marker inline-block w-2.5 h-3 shrink-0 bg-bronze-text" />
        Realized, {band.cycleLabel}
      </span>
    ),
  ];

  if (compact) {
    return (
      <p className="text-[13px] text-ink-soft leading-relaxed">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            {item}
            {i < items.length - 1 && <span className="mx-2 text-ink-faint">{sep}</span>}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-soft">{items}</div>
  );
}

export { Track, Legend };
