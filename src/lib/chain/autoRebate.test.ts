import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  checkAgentBandBreaches: vi.fn(),
  getUnrebatedHiresForAgent: vi.fn(),
  claimRebate: vi.fn(),
  finalizeRebate: vi.fn(),
  releaseRebateClaim: vi.fn(),
  payRebate: vi.fn(),
}));

vi.mock("./bandBreach", () => ({
  checkAgentBandBreaches: mocks.checkAgentBandBreaches,
}));
vi.mock("./hires", () => ({
  getUnrebatedHiresForAgent: mocks.getUnrebatedHiresForAgent,
  claimRebate: mocks.claimRebate,
  finalizeRebate: mocks.finalizeRebate,
  releaseRebateClaim: mocks.releaseRebateClaim,
}));
vi.mock("@/lib/wallet/altanaPool", () => ({
  payRebate: mocks.payRebate,
}));

const { runAutoRebateCheck } = await import("./autoRebate");

const BREACH = {
  breached: true,
  reason: "1 of 1 real agents missed their promised band: Sentry HF.",
  breaches: [{ agentId: "sentry-hf", agentName: "Sentry HF", reason: "missed the band" }],
};

const HIRE = {
  id: "hire-1",
  agentId: "sentry-hf",
  walletAddress: "0x1111111111111111111111111111111111111111" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runAutoRebateCheck", () => {
  it("does nothing when no agent has breached", async () => {
    mocks.checkAgentBandBreaches.mockReturnValue({ breached: false, reason: "all clean", breaches: [] });
    const result = await runAutoRebateCheck();
    expect(result).toEqual({ breached: false, reason: "all clean", paid: [], skipped: [] });
    expect(mocks.getUnrebatedHiresForAgent).not.toHaveBeenCalled();
  });

  it("skips a breached agent with no real hires yet, without claiming or paying anything", async () => {
    mocks.checkAgentBandBreaches.mockReturnValue(BREACH);
    mocks.getUnrebatedHiresForAgent.mockResolvedValue([]);
    const result = await runAutoRebateCheck();
    expect(result.paid).toEqual([]);
    expect(result.skipped).toHaveLength(1);
    expect(mocks.claimRebate).not.toHaveBeenCalled();
    expect(mocks.payRebate).not.toHaveBeenCalled();
  });

  it("claims, pays, and finalizes a real unrebated hire — claim strictly before pay", async () => {
    mocks.checkAgentBandBreaches.mockReturnValue(BREACH);
    mocks.getUnrebatedHiresForAgent.mockResolvedValue([HIRE]);

    const callOrder: string[] = [];
    mocks.claimRebate.mockImplementation(async () => {
      callOrder.push("claim");
      return { ok: true, claimId: "claim-1" };
    });
    mocks.payRebate.mockImplementation(async () => {
      callOrder.push("pay");
      return { ok: true, mode: "live", txHash: "0xdeadbeef" };
    });
    mocks.finalizeRebate.mockResolvedValue({ ok: true });

    const result = await runAutoRebateCheck();

    // Order matters for the race fix: claim (the atomic DB guard) must
    // happen before the real on-chain transfer, never after.
    expect(callOrder).toEqual(["claim", "pay"]);
    expect(mocks.payRebate).toHaveBeenCalledWith(HIRE.walletAddress, expect.any(BigInt), expect.any(String));
    expect(mocks.finalizeRebate).toHaveBeenCalledWith("claim-1", "0xdeadbeef");
    expect(mocks.releaseRebateClaim).not.toHaveBeenCalled();
    expect(result.paid).toHaveLength(1);
    expect(result.paid[0].hireId).toBe("hire-1");
    expect(result.skipped).toEqual([]);
  });

  it("never calls payRebate when the claim loses the race (concurrent run already claimed it)", async () => {
    mocks.checkAgentBandBreaches.mockReturnValue(BREACH);
    mocks.getUnrebatedHiresForAgent.mockResolvedValue([HIRE]);
    mocks.claimRebate.mockResolvedValue({ ok: false, error: "Already claimed by a concurrent run, skipping." });

    const result = await runAutoRebateCheck();

    expect(mocks.payRebate).not.toHaveBeenCalled();
    expect(mocks.finalizeRebate).not.toHaveBeenCalled();
    expect(result.paid).toEqual([]);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toContain("Already claimed");
  });

  it("releases the claim when payment fails, so a future run can retry", async () => {
    mocks.checkAgentBandBreaches.mockReturnValue(BREACH);
    mocks.getUnrebatedHiresForAgent.mockResolvedValue([HIRE]);
    mocks.claimRebate.mockResolvedValue({ ok: true, claimId: "claim-1" });
    mocks.payRebate.mockResolvedValue({ ok: false, mode: "live", error: "insufficient session spend cap" });

    const result = await runAutoRebateCheck();

    expect(mocks.releaseRebateClaim).toHaveBeenCalledWith("claim-1");
    expect(mocks.finalizeRebate).not.toHaveBeenCalled();
    expect(result.paid).toEqual([]);
    expect(result.skipped[0].reason).toContain("Payout attempt failed");
  });

  it("does NOT release the claim when payment succeeds but finalizing the ledger row fails (payment already happened — releasing would risk paying it again)", async () => {
    mocks.checkAgentBandBreaches.mockReturnValue(BREACH);
    mocks.getUnrebatedHiresForAgent.mockResolvedValue([HIRE]);
    mocks.claimRebate.mockResolvedValue({ ok: true, claimId: "claim-1" });
    mocks.payRebate.mockResolvedValue({ ok: true, mode: "live", txHash: "0xdeadbeef" });
    mocks.finalizeRebate.mockResolvedValue({ ok: false, error: "db unreachable" });

    const result = await runAutoRebateCheck();

    expect(mocks.releaseRebateClaim).not.toHaveBeenCalled();
    expect(result.paid).toEqual([]);
    expect(result.skipped[0].reason).toContain("Paid (tx 0xdeadbeef) but failed to finalize");
  });
});
