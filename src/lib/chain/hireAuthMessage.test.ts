import { describe, expect, it, vi } from "vitest";
import { buildHireAuthMessage, messageIsFresh } from "./hireAuthMessage";

describe("buildHireAuthMessage", () => {
  it("embeds a Time: line the freshness check can parse", () => {
    const message = buildHireAuthMessage({
      agentId: "meridian-rebalancer",
      agentName: "Meridian Rebalancer",
      budgetHuman: "2,500",
      walletAddress: "0x1111111111111111111111111111111111111111",
    });
    expect(messageIsFresh(message)).toBe(true);
    expect(message).toContain("Wallet: 0x1111111111111111111111111111111111111111");
  });
});

describe("messageIsFresh", () => {
  it("accepts a message signed just now", () => {
    expect(messageIsFresh(`Time: ${new Date().toISOString()}`)).toBe(true);
  });

  it("accepts a message right at the edge of the 5-minute window", () => {
    const almostStale = new Date(Date.now() - 5 * 60 * 1000 + 1000).toISOString();
    expect(messageIsFresh(`Time: ${almostStale}`)).toBe(true);
  });

  it("rejects a replayed message older than 5 minutes", () => {
    const stale = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    expect(messageIsFresh(`Time: ${stale}`)).toBe(false);
  });

  it("rejects a message backdated by exactly the guard's own boundary plus a hair", () => {
    const justOverStale = new Date(Date.now() - 5 * 60 * 1000 - 1000).toISOString();
    expect(messageIsFresh(`Time: ${justOverStale}`)).toBe(false);
  });

  it("rejects a message claiming a future timestamp (clock skew or a forged forward-dated signature)", () => {
    const future = new Date(Date.now() + 60 * 1000).toISOString();
    expect(messageIsFresh(`Time: ${future}`)).toBe(false);
  });

  it("rejects a message with no Time: line at all", () => {
    expect(messageIsFresh("Backstop hire authorization\nAgent: x")).toBe(false);
  });

  it("rejects a message with an unparseable Time: value", () => {
    expect(messageIsFresh("Time: not-a-real-date")).toBe(false);
  });

  it("is independent of real time drift (uses Date.now() at call time, not import time)", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const message = `Time: ${new Date().toISOString()}`;
      expect(messageIsFresh(message)).toBe(true);
      vi.setSystemTime(new Date("2026-01-01T00:10:00.000Z")); // 10 min later
      expect(messageIsFresh(message)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
