"use server";

import { supabase } from "@/lib/supabase";
import { getAgent } from "@/lib/agents";

/**
 * Real rebate payouts, read-only — for /pool's ledger. Distinct from the
 * static, illustrative `REBATE_LOG` in src/lib/pool.ts: every row here
 * corresponds to an actual `rebates` table insert made by
 * src/lib/chain/autoRebate.ts after a real on-chain transfer succeeded.
 */
export interface RealRebateEntry {
  id: string;
  agentId: string;
  agentName: string;
  amountRaw: string;
  txHash: string | null;
  reason: string;
  paidAt: string;
}

export async function getRecentRebates(limit = 10): Promise<RealRebateEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("rebates")
    .select("id, agent_id, amount_raw, tx_hash, reason, paid_at")
    // Only ever surface completed payouts — a "pending" row is an in-flight
    // claim (see supabase/migrations/*_rebate_claim_status.sql), not yet a
    // real transfer, and must never be shown as one.
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    agentId: r.agent_id,
    agentName: getAgent(r.agent_id)?.name ?? r.agent_id,
    amountRaw: r.amount_raw,
    txHash: r.tx_hash,
    reason: r.reason,
    paidAt: r.paid_at,
  }));
}
