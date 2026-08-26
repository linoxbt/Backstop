import "server-only";
import { payRebate, type PayRebateResult } from "@/lib/wallet/altanaPool";
import { checkAgentBandBreaches } from "./bandBreach";
import { claimRebate, finalizeRebate, getUnrebatedHiresForAgent, releaseRebateClaim } from "./hires";

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
 * from the assurance pool's Altana session and record it.
 *
 * Idempotency (and safety against a concurrent double-pay) is enforced by
 * claiming a hire in the database *before* ever touching the chain: only
 * one concurrent caller's insert into `rebates` (status "pending") can win
 * the unique constraint on `hire_id`; the loser skips without having paid
 * anything. The winner then pays and finalizes the same row to "paid". A
 * payout that fails releases its claim so a future run can retry; a payout
 * that *succeeds* but fails to finalize is never released — the real
 * transfer already happened, so un-claiming it would risk paying it again.
 * This is what makes it safe to call repeatedly (e.g. every 30 minutes from
 * the cron workflow, or a manual workflow_dispatch overlapping it) without
 * risking a double-pay across cold starts or concurrent invocations. Called
 * from the authenticated cron route handler, never from a page render.
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
      const claim = await claimRebate({
        hireId: hire.id,
        agentId: breach.agentId,
        amountRaw: REBATE_AMOUNT_RAW.toString(),
        reason: breach.reason,
      });
      if (!claim.ok || !claim.claimId) {
        skipped.push({
          agentId: breach.agentId,
          agentName: breach.agentName,
          reason: `Skipped hire ${hire.id}: ${claim.error ?? "unknown error"}`,
        });
        continue;
      }

      const payout = await payRebate(hire.walletAddress, REBATE_AMOUNT_RAW, breach.reason);
      if (!payout.ok) {
        // Nothing was transferred — safe to release the claim for a future
        // run to retry.
        await releaseRebateClaim(claim.claimId);
        skipped.push({
          agentId: breach.agentId,
          agentName: breach.agentName,
          reason: `Payout attempt failed for hire ${hire.id}: ${payout.error ?? "unknown error"}`,
        });
        continue;
      }

      const finalized = await finalizeRebate(claim.claimId, payout.txHash);
      if (!finalized.ok) {
        // The on-chain transfer already happened — do NOT release the
        // claim (that would risk paying this hire again next run). Surface
        // this distinctly so it can be reconciled manually instead of
        // silently dropping a real payout from the response.
        skipped.push({
          agentId: breach.agentId,
          agentName: breach.agentName,
          reason: `Paid (tx ${payout.txHash}) but failed to finalize the ledger row: ${finalized.error}`,
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
