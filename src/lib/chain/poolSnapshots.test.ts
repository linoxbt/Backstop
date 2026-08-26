import { describe, expect, it } from "vitest";
import { computePoolDrift, type PoolSnapshotRow } from "./poolSnapshots";

function snap(overrides: Partial<PoolSnapshotRow> = {}): PoolSnapshotRow {
  return {
    tick: 46046,
    liquidity: "1000000000000000000",
    price: 1.23,
    feeTier: 100,
    capturedAt: "2026-08-26T00:00:00.000Z",
    ...overrides,
  };
}

describe("computePoolDrift", () => {
  it("returns null with fewer than 2 snapshots", () => {
    expect(computePoolDrift([])).toBeNull();
    expect(computePoolDrift([snap()])).toBeNull();
  });

  it("computes tick delta and window across the oldest and newest snapshot (newest-first input)", () => {
    const newest = snap({ tick: 46100, capturedAt: "2026-08-26T02:00:00.000Z" });
    const middle = snap({ tick: 46080, capturedAt: "2026-08-26T01:00:00.000Z" });
    const oldest = snap({ tick: 46046, capturedAt: "2026-08-26T00:00:00.000Z" });
    const drift = computePoolDrift([newest, middle, oldest]);
    expect(drift).toEqual({
      tickDelta: 54,
      windowHours: 2,
      oldestTick: 46046,
      newestTick: 46100,
      snapshotCount: 3,
    });
  });

  it("reports a negative delta when the tick moved down", () => {
    const newest = snap({ tick: 100, capturedAt: "2026-08-26T01:00:00.000Z" });
    const oldest = snap({ tick: 150, capturedAt: "2026-08-26T00:00:00.000Z" });
    const drift = computePoolDrift([newest, oldest]);
    expect(drift?.tickDelta).toBe(-50);
  });

  it("never fabricates a value beyond the real snapshot pair given", () => {
    const newest = snap({ tick: 200, capturedAt: "2026-08-26T00:30:00.000Z" });
    const oldest = snap({ tick: 200, capturedAt: "2026-08-26T00:00:00.000Z" });
    const drift = computePoolDrift([newest, oldest]);
    expect(drift?.tickDelta).toBe(0);
    expect(drift?.windowHours).toBeCloseTo(0.5, 5);
  });
});
