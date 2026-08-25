import "server-only";
import { payRebate, type PayRebateResult } from "@/lib/wallet/altanaPool";
import { checkAgentBandBreaches } from "./bandBreach";
import { getUnrebatedHiresForAgent, recordRebate } from "./hires";

/**
 * Fixed per-hire payout for a breached cycle — a deliberately small, explicit
 * amount distinct from the illustrative percentage-based rebates shown in
 * the static REBATE_LOG. 5 U at 18 decimals.
 */
const REBATE_AMOUNT_RAW = BigInt("5000000000000000000");

export interface PaidRebate {
  agentId: string;
  agentName: string;
  hireId: string;
  walletAddress: string;
  payout: PayRebateResult;
}

export interface SkippedRebate {
  agentId: string;
  agentName: string;
  reason: string;
}

export interface AutoRebateResult {
  breached: boolean;
  reason: string;
  paid: PaidRebate[];
  skipped: SkippedRebate[];
}

/**
 * Check the real breach condition (does any real agent's assurance band say
 * it missed its promise?) and, for every real hire against a breached agent
 * that hasn't been rebated yet, pay that hirer's own wallet a real rebate
 * from the assurance pool's Altana session and record it. Idempotency is
 * enforced by the database (`rebates.hire_id` is unique — see
 * getUnrebatedHiresForAgent / the create_rebates_table migration), not an
 * in-memory cooldown, so this is safe to call repeatedly (e.g. every 30
 * minutes from the cron workflow) without risking a double-pay across cold
 * starts. Called from the authenticated cron route handler, never from a
 * page render.
 */
export async function runAutoRebateCheck(): Promise<AutoRebateResult> {
  const check = checkAgentBandBreaches();
  if (!check.breached) {
    return { breached: false, reason: check.reason, paid: [], skipped: [] };
  }

  const paid: PaidRebate[] = [];
  const skipped: SkippedRebate[] = [];

  for (const breach of check.breaches) {
    const hires = await getUnrebatedHiresForAgent(breach.agentId);
    if (hires.length === 0) {
      skipped.push({
        agentId: breach.agentId,
        agentName: breach.agentName,
        reason: "No real hires to rebate for this agent yet.",
      });
      continue;
    }

    for (const hire of hires) {
      const payout = await payRebate(hire.walletAddress, REBATE_AMOUNT_RAW, breach.reason);
      if (!payout.ok) {
        skipped.push({
          agentId: breach.agentId,
          agentName: breach.agentName,
          reason: `Payout attempt failed for hire ${hire.id}: ${payout.error ?? "unknown error"}`,
        });
        continue;
      }

      const recorded = await recordRebate({
        hireId: hire.id,
        agentId: breach.agentId,
        amountRaw: REBATE_AMOUNT_RAW.toString(),
        txHash: payout.txHash,
        reason: breach.reason,
      });
      if (!recorded.ok) {
        // The on-chain transfer already happened — this only means the
        // ledger row failed to write, so surface it distinctly rather than
        // silently dropping a real payout from the response.
        skipped.push({
          agentId: breach.agentId,
          agentName: breach.agentName,
          reason: `Paid (tx ${payout.txHash}) but failed to record: ${recorded.error}`,
        });
        continue;
      }

      paid.push({
        agentId: breach.agentId,
        agentName: breach.agentName,
        hireId: hire.id,
        walletAddress: hire.walletAddress,
        payout,
      });
    }
  }

  return { breached: true, reason: check.reason, paid, skipped };
}
