import { describe, expect, it } from "vitest";
import { evaluatePancakeLiquidityBreach } from "./rebalanceBreach";
import type { PoolState } from "@/lib/pancakeswap";

const LIVE_POOL: PoolState = {
  poolAddress: "0x1111111111111111111111111111111111111a",
  feeTier: 2500,
  tick: -1234,
  liquidity: "9876543210",
  price: 500.12,
  token0: "0x2222222222222222222222222222222222222b",
  token1: "0x3333333333333333333333333333333333333c",
};

describe("evaluatePancakeLiquidityBreach", () => {
  it("is not a breach when a live, liquid pool is found", () => {
    const result = evaluatePancakeLiquidityBreach(LIVE_POOL);
    expect(result.breached).toBe(false);
    expect(result.pool).toBe(LIVE_POOL);
  });

  it("is a breach when no pool has any liquidity", () => {
    const result = evaluatePancakeLiquidityBreach(null);
    expect(result.breached).toBe(true);
    expect(result.pool).toBeNull();
    expect(result.reason).toMatch(/no live pancakeswap/i);
  });
});
