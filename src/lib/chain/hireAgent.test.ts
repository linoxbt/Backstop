import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  keystoreExists: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@bnbagent/sdk", () => ({
  ERC8183Client: { create: mocks.createClient },
  EVMWalletProvider: class {
    static keystoreExists = mocks.keystoreExists;
  },
  JobStatus: {},
}));

const { hireAgentOnChain } = await import("./hireAgent");

let callerIpCounter = 0;

beforeEach(() => {
  vi.clearAllMocks();
  // A distinct, guaranteed-unique caller IP per test — the rate limiter
  // (src/lib/rateLimit.ts) keys on this and, with no Supabase configured in
  // this test env, falls back to a module-scoped in-memory Map shared
  // across every test in this file. Reusing one IP would make every test
  // after the first fail on the 15s cooldown instead of exercising the gate
  // it's actually meant to test.
  callerIpCounter += 1;
  mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": `203.0.113.${callerIpCounter}` }));
  mocks.keystoreExists.mockReturnValue(false);
  delete process.env.PRIVATE_KEY;
  delete process.env.WALLET_PASSWORD;
  delete process.env.DEMO_PROVIDER_ADDRESS;
});

describe("hireAgentOnChain — gating (never fakes a live result)", () => {
  it("falls back to simulated when the agent has no onchain provider address and no DEMO_PROVIDER_ADDRESS", async () => {
    const result = await hireAgentOnChain(undefined, "2,500");
    expect(result).toEqual({
      ok: false,
      mode: "simulated",
      error: expect.stringContaining("no live onchain provider address"),
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("falls back to simulated when no hirer wallet is configured (no PRIVATE_KEY, no keystore)", async () => {
    const result = await hireAgentOnChain("0x1111111111111111111111111111111111111111", "2,500");
    expect(result.ok).toBe(false);
    expect(result.mode).toBe("simulated");
    expect(result.error).toContain("No hirer wallet configured");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("falls back to simulated when PRIVATE_KEY is set but WALLET_PASSWORD is missing", async () => {
    process.env.PRIVATE_KEY = "0xabc";
    const result = await hireAgentOnChain("0x1111111111111111111111111111111111111111", "2,500");
    expect(result.mode).toBe("simulated");
    expect(result.error).toContain("WALLET_PASSWORD");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("falls back to simulated on an invalid budget before ever touching the chain", async () => {
    process.env.PRIVATE_KEY = "0xabc";
    process.env.WALLET_PASSWORD = "hunter2";
    const result = await hireAgentOnChain("0x1111111111111111111111111111111111111111", "not-a-number");
    expect(result.mode).toBe("simulated");
    expect(result.error).toBe("Enter a valid budget.");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("uses DEMO_PROVIDER_ADDRESS as a fallback when the agent itself has none, but still gates on a configured wallet", async () => {
    process.env.DEMO_PROVIDER_ADDRESS = "0x2222222222222222222222222222222222222222";
    const result = await hireAgentOnChain(undefined, "2,500");
    expect(result.mode).toBe("simulated");
    expect(result.error).toContain("No hirer wallet configured");
  });
});
