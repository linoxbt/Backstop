import "server-only";
import { AGENTS } from "@/lib/agents";
import type { Agent } from "@/lib/types";

/**
 * The real payout trigger for the assurance pool: does a real, on-chain
 * agent's `AssuranceBand.status` say it missed its promised band? This is
 * the exact signal `/pool`'s "clean entries" list and
 * `AssuranceBandInteractive` already treat as ground truth everywhere else
 * in the app, so reusing it here is what actually makes "miss the band ->
 * the pool pays a capped rebate, automatically" (GuaranteeSteps.tsx's own
 * copy) true, instead of the unrelated PancakeSwap-liquidity proxy this
 * replaced (still available, honestly, as `rebalanceBreach.ts` — it just no
 * longer decides who gets paid).
 *
 * One caveat this doesn't solve: `band.status` is still static, illustrative
 * per-agent data (src/lib/agents.ts), not a live measurement of what an
 * agent actually did this cycle — nothing in this app observes real agent
 * execution yet. What changed is that the payout now honestly tracks the
 * same number the product's own UI already shows as the guarantee's
 * verdict, rather than a second, disconnected proxy condition.
 */

export interface AgentBreach {
  agentId: string;
  agentName: string;
  reason: string;
}

export interface BandBreachCheckResult {
  breached: boolean;
  reason: string;
  breaches: AgentBreach[];
}

export function evaluateBandBreaches(agents: Agent[]): BandBreachCheckResult {
  const realAgents = agents.filter((a) => a.providerAddress);
  const breaches: AgentBreach[] = realAgents
    .filter((a) => a.band.status === "breach")
    .map((a) => ({
      agentId: a.id,
      agentName: a.name,
      reason: `${a.name}: realized ${a.band.realized}${a.band.symbol} ${a.band.unit} missed the promised band [${a.band.promisedLow}${a.band.symbol}, ${a.band.promisedHigh}${a.band.symbol}] for ${a.band.cycleLabel}.`,
    }));

  if (breaches.length === 0) {
    return {
      breached: false,
      reason: `All ${realAgents.length} real, on-chain agents are within their promised band.`,
      breaches: [],
    };
  }
  return {
    breached: true,
    reason: `${breaches.length} of ${realAgents.length} real agents missed their promised band: ${breaches
      .map((b) => b.agentName)
      .join(", ")}.`,
    breaches,
  };
}

export function checkAgentBandBreaches(): BandBreachCheckResult {
  return evaluateBandBreaches(AGENTS);
}
