"use server";

import { verifyMessage } from "viem";
import { supabase, supabaseAdmin } from "@/lib/supabase";

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

const AUTH_MESSAGE_MAX_AGE_SECONDS = 5 * 60;

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

function messageIsFresh(message: string): boolean {
  const match = message.match(/^Time: (.+)$/m);
  if (!match) return false;
  const issuedAt = Date.parse(match[1]);
  if (Number.isNaN(issuedAt)) return false;
  const ageSeconds = (Date.now() - issuedAt) / 1000;
  // Reject both a stale replay and a message claiming a future timestamp
  // (a clock-skewed or deliberately backdated/forwarded signature).
  return ageSeconds >= 0 && ageSeconds <= AUTH_MESSAGE_MAX_AGE_SECONDS;
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
    wallet_address: input.walletAddress,
    agent_id: input.agentId,
    budget_human: input.budgetHuman,
    job_id: input.jobId ?? null,
    tx_hash: input.txHash ?? null,
    mode: input.mode,
    auth_message: input.message,
    auth_signature: input.signature,
  });
  if (error) return { ok: false, error: error.message };
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

type RebateEmbed = { tx_hash: string | null; amount_raw: string } | { tx_hash: string | null; amount_raw: string }[] | null;

function firstRebate(rebates: RebateEmbed) {
  return Array.isArray(rebates) ? rebates[0] : rebates;
}

export async function getHiresForWallet(walletAddress: string): Promise<HireRecord[]> {
  if (!supabase || !walletAddress) return [];
  const { data, error } = await supabase
    .from("hires")
    .select("id, agent_id, budget_human, job_id, tx_hash, mode, created_at, rebates(tx_hash, amount_raw)")
    .ilike("wallet_address", walletAddress)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => {
    const rebate = firstRebate(r.rebates as RebateEmbed);
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

export interface RecordRebateInput {
  hireId: string;
  agentId: string;
  amountRaw: string;
  txHash?: string;
  reason: string;
}

/**
 * Insert a real rebate row. The `hire_id` unique constraint (see the
 * create_rebates_table migration) is what actually prevents a double-pay
 * for the same hire — this function doesn't need its own locking, a
 * conflicting insert simply fails.
 */
export async function recordRebate(input: RecordRebateInput): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: "Rebate recording isn't configured (SUPABASE_SERVICE_ROLE_KEY unset)." };
  }
  const { error } = await supabaseAdmin.from("rebates").insert({
    hire_id: input.hireId,
    agent_id: input.agentId,
    amount_raw: input.amountRaw,
    tx_hash: input.txHash ?? null,
    reason: input.reason,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
