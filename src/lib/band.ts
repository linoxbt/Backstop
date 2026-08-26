import type { AssuranceBand } from "./types";

export function bandPct(band: AssuranceBand, value: number): number {
  const range = band.scaleMax - band.scaleMin;
  // Every real band in src/lib/agents.ts has scaleMax > scaleMin, but this
  // is display math driven by hand-authored data — a future zero-width
  // band (a typo, not a real scenario) should render as a flat 0%, not
  // silently propagate NaN/Infinity through every consumer of this value.
  if (range <= 0) return 0;
  const pct = ((value - band.scaleMin) / range) * 100;
  return Math.min(100, Math.max(0, pct));
}
