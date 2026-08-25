import { describe, expect, it } from "vitest";
import { evaluateBandBreaches } from "./bandBreach";
import type { Agent } from "@/lib/types";

function makeAgent(overrides: Partial<Agent> & Pick<Agent, "id" | "name">): Agent {
  return {
    category: "rebalancing",
    tagline: "",
    description: "",
    operator: "",
    agentId8004: "",
    network: "BSC Testnet",
    protocols: [],
    feeModel: "",
    poolContribution: "",
    cyclesCompleted: 1,
    hirers: 1,
    manifestHash: "0x0",
    jobStage: "SETTLED",
    band: {
      symbol: "%",
      unit: "cycle return",
      scaleMin: 0,
      scaleMax: 10,
      historicalLow: 1,
      historicalHigh: 9,
      promisedLow: 3,
      promisedHigh: 7,
      realized: 5,
      cycleLabel: "Window 1",
      status: "within",
    },
    ...overrides,
  };
}

describe("evaluateBandBreaches", () => {
  it("is not a breach when every real agent is within its band", () => {
    const agents = [
      makeAgent({ id: "a", name: "A", providerAddress: "0x1111111111111111111111111111111111111a" }),
      makeAgent({ id: "b", name: "B" }), // no providerAddress — illustrative, ignored
    ];
    const result = evaluateBandBreaches(agents);
    expect(result.breached).toBe(false);
    expect(result.breaches).toEqual([]);
  });

  it("flags a real agent whose band status is breach", () => {
    const agents = [
      makeAgent({
        id: "a",
        name: "A",
        providerAddress: "0x1111111111111111111111111111111111111a",
        band: { ...makeAgent({ id: "a", name: "A" }).band, status: "breach", realized: 1 },
      }),
    ];
    const result = evaluateBandBreaches(agents);
    expect(result.breached).toBe(true);
    expect(result.breaches).toHaveLength(1);
    expect(result.breaches[0].agentId).toBe("a");
  });

  it("ignores a breached illustrative agent with no providerAddress", () => {
    const agents = [
      makeAgent({
        id: "a",
        name: "A",
        band: { ...makeAgent({ id: "a", name: "A" }).band, status: "breach", realized: 1 },
      }),
    ];
    const result = evaluateBandBreaches(agents);
    expect(result.breached).toBe(false);
    expect(result.breaches).toEqual([]);
  });

  it("only includes breached agents in the breach list, not within/pending ones", () => {
    const breached = makeAgent({
      id: "a",
      name: "A",
      providerAddress: "0x1111111111111111111111111111111111111a",
      band: { ...makeAgent({ id: "a", name: "A" }).band, status: "breach", realized: 1 },
    });
    const within = makeAgent({ id: "b", name: "B", providerAddress: "0x2222222222222222222222222222222222222b" });
    const pending = makeAgent({
      id: "c",
      name: "C",
      providerAddress: "0x3333333333333333333333333333333333333c",
      band: { ...makeAgent({ id: "c", name: "C" }).band, status: "pending", realized: null },
    });
    const result = evaluateBandBreaches([breached, within, pending]);
    expect(result.breaches.map((b) => b.agentId)).toEqual(["a"]);
  });
});
