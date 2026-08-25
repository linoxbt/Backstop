import { describe, expect, it } from "vitest";
import { bandPct } from "./band";
import type { AssuranceBand } from "./types";

function band(overrides: Partial<AssuranceBand> = {}): AssuranceBand {
  return {
    symbol: "%",
    unit: "cycle return",
    scaleMin: 0,
    scaleMax: 10,
    historicalLow: 4,
    historicalHigh: 8,
    promisedLow: 5,
    promisedHigh: 7,
    realized: 6,
    cycleLabel: "Cycle 1",
    status: "within",
    ...overrides,
  };
}

describe("bandPct", () => {
  it("maps scaleMin to 0", () => {
    expect(bandPct(band(), 0)).toBe(0);
  });

  it("maps scaleMax to 100", () => {
    expect(bandPct(band(), 10)).toBe(100);
  });

  it("maps the midpoint to 50", () => {
    expect(bandPct(band(), 5)).toBe(50);
  });

  it("clamps a value below scaleMin to 0", () => {
    expect(bandPct(band(), -100)).toBe(0);
  });

  it("clamps a value above scaleMax to 100", () => {
    expect(bandPct(band(), 1000)).toBe(100);
  });

  it("handles a non-zero scaleMin correctly", () => {
    const b = band({ scaleMin: 1.0, scaleMax: 1.9 });
    // matches the health-factor agents' real scale (e.g. Sentry HF)
    expect(bandPct(b, 1.35)).toBeCloseTo(38.888888, 5);
  });

  it("handles negative scaleMin/scaleMax spans", () => {
    const b = band({ scaleMin: -10, scaleMax: 10 });
    expect(bandPct(b, 0)).toBe(50);
    expect(bandPct(b, -10)).toBe(0);
    expect(bandPct(b, 10)).toBe(100);
  });
});
