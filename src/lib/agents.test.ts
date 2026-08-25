import { describe, expect, it } from "vitest";
import { AGENTS, CATEGORIES, agentsByCategory, categoryMeta, getAgent, isCategory } from "./agents";

describe("isCategory", () => {
  it("accepts every real category id", () => {
    for (const c of CATEGORIES) {
      expect(isCategory(c.id)).toBe(true);
    }
  });

  it("rejects an invalid category string", () => {
    expect(isCategory("not-a-real-category")).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isCategory(undefined)).toBe(false);
  });
});

describe("getAgent", () => {
  it("finds a known agent by id", () => {
    expect(getAgent("meridian-rebalancer")?.name).toBe("Meridian Rebalancer");
  });

  it("returns undefined for an unknown id", () => {
    expect(getAgent("does-not-exist")).toBeUndefined();
  });
});

describe("agentsByCategory", () => {
  it("only returns agents in the requested category", () => {
    const results = agentsByCategory("yield");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((a) => a.category === "yield")).toBe(true);
  });

  it("returns an empty array for a category with no agents", () => {
    expect(agentsByCategory("not-a-real-category")).toEqual([]);
  });
});

describe("categoryMeta", () => {
  it("finds metadata for a known category", () => {
    expect(categoryMeta("rebalancing")?.label).toBe("Rebalancing");
  });
});

describe("data integrity", () => {
  it("every agent belongs to a real category", () => {
    for (const agent of AGENTS) {
      expect(isCategory(agent.category)).toBe(true);
    }
  });

  it("every agent's band has a valid scale (scaleMin < scaleMax)", () => {
    for (const agent of AGENTS) {
      expect(agent.band.scaleMin).toBeLessThan(agent.band.scaleMax);
    }
  });

  it("every agent's promised range is ordered correctly", () => {
    for (const agent of AGENTS) {
      expect(agent.band.promisedLow).toBeLessThanOrEqual(agent.band.promisedHigh);
    }
  });

  it("a breach status always carries a rebate, and within/pending never do", () => {
    for (const agent of AGENTS) {
      if (agent.band.status === "breach") {
        expect(agent.band.rebate).toBeDefined();
      } else {
        expect(agent.band.rebate).toBeUndefined();
      }
    }
  });

  it("a pending status always has a null realized value", () => {
    for (const agent of AGENTS) {
      if (agent.band.status === "pending") {
        expect(agent.band.realized).toBeNull();
      }
    }
  });

  it("agent ids are unique", () => {
    const ids = AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
