import type { AssuranceBand } from "./types";

export function bandPct(band: AssuranceBand, value: number): number {
  const pct = ((value - band.scaleMin) / (band.scaleMax - band.scaleMin)) * 100;
  return Math.min(100, Math.max(0, pct));
}
