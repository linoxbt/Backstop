import { bandPct } from "@/lib/band";
import type { AssuranceBand } from "@/lib/types";

const VIEW = 100;
const CENTER = 50;
const HIST_RADIUS = 42;
const PROM_RADIUS = 33;

/**
 * A single arc segment expressed as a stroke-dasharray/dashoffset pair on a
 * circle of the given radius — the standard technique for a partial radial
 * ring, avoiding hand-rolled SVG arc-path math (large-arc-flag etc.). The
 * circle is rotated -90deg by the caller so 0% starts at 12 o'clock.
 */
function arc(radius: number, fromPct: number, toPct: number) {
  const circumference = 2 * Math.PI * radius;
  const from = Math.max(0, Math.min(100, fromPct));
  const to = Math.max(0, Math.min(100, toPct));
  const length = ((to - from) / 100) * circumference;
  return {
    dasharray: `${length} ${circumference - length}`,
    dashoffset: -((from / 100) * circumference),
  };
}

/**
 * The landing page's "bespoke icon" per category — except it isn't
 * decoration commissioned for the occasion, it's a polar rewrite of the
 * exact same primitives DarkBandBar.tsx already draws horizontally: a
 * representative real agent's historical corridor, promised band, and
 * realized marker, mapped onto a full-circle gauge instead of a bar. Same
 * `bandPct` math, same data, just a different projection — the category's
 * "icon" is a genuine visualization of what it actually promised and
 * delivered, not an illustration standing in for it.
 */
export function CategorySeal({ band, size = 200 }: { band: AssuranceBand; size?: number }) {
  const hist = arc(HIST_RADIUS, bandPct(band, band.historicalLow), bandPct(band, band.historicalHigh));
  const prom = arc(PROM_RADIUS, bandPct(band, band.promisedLow), bandPct(band, band.promisedHigh));
  const realizedPct = band.realized === null ? null : bandPct(band, band.realized);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} fill="none" aria-hidden="true">
      <circle
        cx={CENTER}
        cy={CENTER}
        r={HIST_RADIUS}
        stroke="var(--color-momento-line)"
        strokeWidth="1"
        fill="none"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={PROM_RADIUS}
        stroke="var(--color-momento-line)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      <circle
        cx={CENTER}
        cy={CENTER}
        r={HIST_RADIUS}
        stroke="var(--color-verdigris-soft)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={hist.dasharray}
        strokeDashoffset={hist.dashoffset}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={PROM_RADIUS}
        stroke="var(--color-bronze-bright)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={prom.dasharray}
        strokeDashoffset={prom.dashoffset}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />

      {realizedPct !== null && (
        <line
          x1={CENTER}
          y1={CENTER - HIST_RADIUS - 5}
          x2={CENTER}
          y2={CENTER - PROM_RADIUS + 3}
          stroke="var(--color-bronze-bright)"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${-90 + (realizedPct / 100) * 360} ${CENTER} ${CENTER})`}
        />
      )}
    </svg>
  );
}
