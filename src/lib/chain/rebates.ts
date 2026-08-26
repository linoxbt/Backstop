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

export interface RebateTotals {
  count: number;
  totalAmount: number;
}

/** Every real, paid rebate, summed. Used to back /pool's headline stats with real numbers instead of the static POOL figures. */
export async function getTotalRebateStats(): Promise<RebateTotals> {
  if (!supabase) return { count: 0, totalAmount: 0 };
  const { data, error } = await supabase.from("rebates").select("amount_raw").eq("status", "paid");
  if (error || !data) return { count: 0, totalAmount: 0 };
  return {
    count: data.length,
    totalAmount: data.reduce((sum, r) => sum + Number(r.amount_raw) / 1e18, 0),
  };
}

export interface RealRebateDetail extends RealRebateEntry {
  hireId: string;
  hirerWallet: string;
  hireBudgetHuman: string;
  hireTxHash: string | null;
}

type HireEmbed = { wallet_address: string; budget_human: string; tx_hash: string | null };

/** Full detail for one real rebate, joined with its underlying hire, for the ledger's detail page. */
export async function getRebateById(id: string): Promise<RealRebateDetail | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("rebates")
    .select("id, agent_id, amount_raw, tx_hash, reason, paid_at, hire_id, hires(wallet_address, budget_human, tx_hash)")
    .eq("id", id)
    .eq("status", "paid")
    .maybeSingle();
  if (error || !data) return null;
  const hireEmbed = data.hires as HireEmbed | HireEmbed[] | null;
  const hire = Array.isArray(hireEmbed) ? hireEmbed[0] : hireEmbed;
  return {
    id: data.id,
    agentId: data.agent_id,
    agentName: getAgent(data.agent_id)?.name ?? data.agent_id,
    amountRaw: data.amount_raw,
    txHash: data.tx_hash,
    reason: data.reason,
    paidAt: data.paid_at,
    hireId: data.hire_id,
    hirerWallet: hire?.wallet_address ?? "",
    hireBudgetHuman: hire?.budget_human ?? "",
    hireTxHash: hire?.tx_hash ?? null,
  };
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
