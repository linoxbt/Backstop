import type { AssuranceBand } from "@/lib/types";
import { bandPct } from "@/lib/band";

/** The real assurance-band visual (hatch-corridor + wedge-marker, same primitives as AssuranceBand.tsx), recolored for the landing page's dark sections. */
export function DarkBandBar({
  band,
  size = "default",
}: {
  band: AssuranceBand;
  size?: "default" | "compact";
}) {
  const histLeft = bandPct(band, band.historicalLow);
  const histWidth = bandPct(band, band.historicalHigh) - histLeft;
  const promLeft = bandPct(band, band.promisedLow);
  const promWidth = bandPct(band, band.promisedHigh) - promLeft;
  const markerLeft = band.realized === null ? null : bandPct(band, band.realized);
  const h = size === "compact" ? "h-14" : "h-20 md:h-28";

  return (
    <div className={`relative ${h}`}>
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/15" />
      <div
        className="hatch-corridor absolute top-[38%] h-[24%]"
        style={{ left: `${histLeft}%`, width: `${histWidth}%` }}
      />
      <div
        className="absolute top-[30%] h-[40%] border-t border-b border-bronze-bright"
        style={{ left: `${promLeft}%`, width: `${promWidth}%` }}
      />
      {markerLeft !== null && (
        <div
          className="wedge-marker absolute top-[10%] w-3 h-[80%] bg-bronze-bright"
          style={{ left: `${markerLeft}%` }}
        />
      )}
      <span className="absolute top-0 left-0 font-data text-[10px] text-white/30 tabnum">
        {band.scaleMin}
        {band.symbol}
      </span>
      <span className="absolute top-0 right-0 font-data text-[10px] text-white/30 tabnum">
        {band.scaleMax}
        {band.symbol}
      </span>
    </div>
  );
}
