"use server";

import { verifyMessage } from "viem";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { messageIsFresh } from "./hireAuthMessage";

/**
 * Real, wallet-scoped hire records — not illustrative. The wallet that
 * signs `message` is cryptographically verified against `walletAddress`
 * server-side before anything is stored. This does NOT mean that wallet
 * paid on-chain: `hireAgentOnChain` still executes the real ERC-8183 job
 * through Backstop's own server-held demo wallet (making the connected
 * wallet the actual transaction signer is a separate, much larger piece
 * of work). What's real here is the authorization: this wallet's owner,
 * provably, asked for this specific hire.
 *
 * Writes go through `supabaseAdmin` (the service-role client), not the
 * publishable-key client — the `hires`/`rebates` tables have no public
 * insert policy (see supabase/migrations/*_restrict_hires_insert.sql), so
 * this signature check is what actually gates a row being created, not
 * just an app-layer nicety a direct REST call could bypass.
 */

export interface RecordHireInput {
  walletAddress: `0x${string}`;
  agentId: string;
  budgetHuman: string;
  jobId?: string;
  txHash?: string;
  mode: "live" | "simulated";
  message: string;
  signature: `0x${string}`;
}

export async function recordHire(input: RecordHireInput): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: "Hire tracking isn't configured (SUPABASE_SERVICE_ROLE_KEY unset)." };
  }

  if (!messageIsFresh(input.message)) {
    return { ok: false, error: "This authorization has expired — sign a fresh hire request and try again." };
  }

  const valid = await verifyMessage({
    address: input.walletAddress,
    message: input.message,
    signature: input.signature,
  }).catch(() => false);
  if (!valid) {
    return { ok: false, error: "Signature didn't match the connected wallet — hire not recorded." };
  }

  const { error } = await supabaseAdmin.from("hires").insert({
    wallet_address: input.walletAddress.toLowerCase(),
    agent_id: input.agentId,
    budget_human: input.budgetHuman,
    job_id: input.jobId ?? null,
    tx_hash: input.txHash ?? null,
    mode: input.mode,
    auth_message: input.message,
    auth_signature: input.signature,
  });
  if (error) {
    // 23505 = unique_violation. hires_auth_signature_key (see
    // supabase/migrations/*_hires_auth_signature_unique.sql) means this
    // exact signed message was already recorded — a replayed submission
    // (double-click, retried request), not a new hire. Treat it as the
    // idempotent success it actually is rather than surfacing an error for
    // something that already succeeded once.
    if (error.code === "23505") return { ok: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export interface HireRecord {
  id: string;
  agentId: string;
  budgetHuman: string;
  jobId: string | null;
  txHash: string | null;
  mode: "live" | "simulated";
  createdAt: string;
  /** True only when a real rebates row exists for this specific hire. */
  rebatePaid: boolean;
  rebateTxHash: string | null;
  rebateAmountRaw: string | null;
}

type RebateRow = { tx_hash: string | null; amount_raw: string; status: string };
type RebateEmbed = RebateRow | RebateRow[] | null;

/**
 * A "pending" row (see the rebate-claim migration) means a payout has been
 * claimed but hasn't actually landed on-chain yet — only "paid" should ever
 * read as a real rebate to a viewer, otherwise My Agents could briefly show
 * "Rebate paid" for a transfer that's still in flight (or that failed and
 * never got un-claimed in time).
 */
function firstPaidRebate(rebates: RebateEmbed) {
  const rows = Array.isArray(rebates) ? rebates : rebates ? [rebates] : [];
  return rows.find((r) => r.status === "paid") ?? null;
}

export async function getHiresForWallet(walletAddress: string): Promise<HireRecord[]> {
  if (!supabase || !walletAddress) return [];
  const { data, error } = await supabase
    .from("hires")
    .select(
      "id, agent_id, budget_human, job_id, tx_hash, mode, created_at, rebates(tx_hash, amount_raw, status)",
    )
    // Plain equality against the normalized-lowercase column (see
    // supabase/migrations/*_normalize_wallet_address_case.sql) — this is
    // what actually lets Postgres use hires_wallet_address_idx. The
    // previous `.ilike(...)` call didn't match that (or any) index, so this
    // was a sequential scan on every My Agents page load.
    .eq("wallet_address", walletAddress.toLowerCase())
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => {
    const rebate = firstPaidRebate(r.rebates as RebateEmbed);
    return {
      id: r.id,
      agentId: r.agent_id,
      budgetHuman: r.budget_human,
      jobId: r.job_id,
      txHash: r.tx_hash,
      mode: r.mode,
      createdAt: r.created_at,
      rebatePaid: Boolean(rebate),
      rebateTxHash: rebate?.tx_hash ?? null,
      rebateAmountRaw: rebate?.amount_raw ?? null,
    };
  });
}

export interface UnrebatedHire {
  id: string;
  agentId: string;
  walletAddress: `0x${string}`;
}

/** Every real, funded hire for `agentId` that doesn't have a rebate yet. */
export async function getUnrebatedHiresForAgent(agentId: string): Promise<UnrebatedHire[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("unrebated_hires")
    .select("id, agent_id, wallet_address")
    .eq("agent_id", agentId)
    .eq("mode", "live");
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    agentId: r.agent_id,
    walletAddress: r.wallet_address as `0x${string}`,
  }));
}

export interface ClaimRebateInput {
  hireId: string;
  agentId: string;
  amountRaw: string;
  reason: string;
}

export interface ClaimRebateResult {
  ok: boolean;
  /** The claimed row's id, present only when ok is true. */
  claimId?: string;
  error?: string;
}

/**
 * Atomically claim a hire for payout *before* touching the chain — this is
 * what actually closes the double-pay race the old recordRebate()-after-
 * payRebate() ordering had: two overlapping cron invocations (a manual
 * workflow_dispatch racing the scheduled run, a slow request retried) could
 * both see the same "unrebated" hire and both execute a real transfer,
 * since only the *recording* was guarded, not the payout itself.
 *
 * The `hire_id` unique constraint on `rebates` means only one concurrent
 * caller's insert can win; the loser gets a `23505` conflict back
 * immediately, before it has paid anything. `unrebated_hires` also stops
 * returning this hire to any *other* caller's next read the instant this
 * insert lands (it excludes any hire with a matching rebates row at all,
 * pending or paid) — so the race is closed at both the read and write side,
 * not just the write side alone.
 */
export async function claimRebate(input: ClaimRebateInput): Promise<ClaimRebateResult> {
  if (!supabaseAdmin) {
    return { ok: false, error: "Rebate recording isn't configured (SUPABASE_SERVICE_ROLE_KEY unset)." };
  }
  const { data, error } = await supabaseAdmin
    .from("rebates")
    .insert({
      hire_id: input.hireId,
      agent_id: input.agentId,
      amount_raw: input.amountRaw,
      reason: input.reason,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Already claimed by a concurrent run — skipping." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, claimId: data.id };
}

/** Mark a claimed rebate as actually paid, with its real transaction hash. */
export async function finalizeRebate(
  claimId: string,
  txHash: string | undefined,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: "Rebate recording isn't configured (SUPABASE_SERVICE_ROLE_KEY unset)." };
  }
  const { error } = await supabaseAdmin
    .from("rebates")
    .update({ status: "paid", tx_hash: txHash ?? null })
    .eq("id", claimId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Release a claim that failed *before* payment executed, so a future run
 * can retry the same hire. Never call this once payRebate has actually
 * succeeded — releasing after a real transfer would let the hire be paid
 * again.
 */
export async function releaseRebateClaim(claimId: string): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from("rebates").delete().eq("id", claimId).eq("status", "pending");
}

export interface AgentHireStats {
  /** Real rows in `hires` for this agent, mode "live" only. */
  realHireCount: number;
  /** Sum of those hires' budget_human, parsed as plain numbers (display only — not raw on-chain units). */
  realVolume: number;
  /** Real rows in `rebates` (status "paid") tied to one of this agent's hires. */
  realRebateCount: number;
  /** Sum of those rebates' amount_raw, in whole payment-token units (18 decimals). */
  realRefunded: number;
}

const EMPTY_STATS: AgentHireStats = { realHireCount: 0, realVolume: 0, realRebateCount: 0, realRefunded: 0 };

function parseBudgetDisplay(budgetHuman: string): number {
  const n = Number(budgetHuman.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export interface AgentVolumeEntry {
  agentId: string;
  realHireCount: number;
  realVolume: number;
}

/**
 * Real hire volume/count per agent, in one batched query — for the
 * marketplace-wide chart, rather than N per-agent round-trips. Same
 * honest-empty shape as every other read here: [] when Supabase isn't
 * configured, never an error.
 */
export async function getRealHireStatsForAllAgents(): Promise<AgentVolumeEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("hires").select("agent_id, budget_human").eq("mode", "live");
  if (!data) return [];

  const byAgent = new Map<string, { count: number; volume: number }>();
  for (const row of data) {
    const current = byAgent.get(row.agent_id) ?? { count: 0, volume: 0 };
    current.count += 1;
    current.volume += parseBudgetDisplay(row.budget_human);
    byAgent.set(row.agent_id, current);
  }
  return [...byAgent.entries()].map(([agentId, v]) => ({
    agentId,
    realHireCount: v.count,
    realVolume: v.volume,
  }));
}

/**
 * Real, per-agent hire/rebate aggregates — no static/illustrative numbers
 * mixed in. Returns all-zero (not an error) when Supabase isn't configured
 * or the agent has no real hires yet, same honest-degradation shape as
 * every other read in this module.
 */
export async function getRealHireStatsForAgent(agentId: string): Promise<AgentHireStats> {
  if (!supabase) return EMPTY_STATS;

  const { data: hireRows } = await supabase
    .from("hires")
    .select("id, budget_human")
    .eq("agent_id", agentId)
    .eq("mode", "live");
  const hires = hireRows ?? [];
  const realHireCount = hires.length;
  const realVolume = hires.reduce((sum, h) => sum + parseBudgetDisplay(h.budget_human), 0);

  if (hires.length === 0) {
    return { realHireCount: 0, realVolume: 0, realRebateCount: 0, realRefunded: 0 };
  }

  const { data: rebateRows } = await supabase
    .from("rebates")
    .select("amount_raw, hire_id")
    .eq("agent_id", agentId)
    .eq("status", "paid")
    .in(
      "hire_id",
      hires.map((h) => h.id),
    );
  const rebates = rebateRows ?? [];
  const realRebateCount = rebates.length;
  const realRefunded = rebates.reduce((sum, r) => sum + Number(r.amount_raw) / 1e18, 0);

  return { realHireCount, realVolume, realRebateCount, realRefunded };
}
