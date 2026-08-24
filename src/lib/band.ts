import type { AssuranceBand } from "./types";

export function bandPct(band: AssuranceBand, value: number): number {
  const pct = ((value - band.scaleMin) / (band.scaleMax - band.scaleMin)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function fmt(value: number, unit: string): string {
  if (unit === "HF") return value.toFixed(2);
  return `${value.toFixed(unit === "bps" ? 0 : 1)}${unit === "bps" ? " bps" : unit === "%" || unit.includes("APY") ? "%" : ""}`;
}
