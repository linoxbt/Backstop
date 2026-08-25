"use server";

import { verifyMessage } from "viem";
import { supabase } from "@/lib/supabase";

/**
 * Real, wallet-scoped hire records — not illustrative. The wallet that
 * signs `message` is cryptographically verified against `walletAddress`
 * server-side before anything is stored. This does NOT mean that wallet
 * paid on-chain: `hireAgentOnChain` still executes the real ERC-8183 job
 * through Backstop's own server-held demo wallet (making the connected
 * wallet the actual transaction signer is a separate, much larger piece
 * of work). What's real here is the authorization: this wallet's owner,
 * provably, asked for this specific hire.
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
  if (!supabase) {
    return { ok: false, error: "Hire tracking isn't configured (NEXT_PUBLIC_SUPABASE_* unset)." };
  }

  const valid = await verifyMessage({
    address: input.walletAddress,
    message: input.message,
    signature: input.signature,
  }).catch(() => false);
  if (!valid) {
    return { ok: false, error: "Signature didn't match the connected wallet — hire not recorded." };
  }

  const { error } = await supabase.from("hires").insert({
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
}

export async function getHiresForWallet(walletAddress: string): Promise<HireRecord[]> {
  if (!supabase || !walletAddress) return [];
  const { data, error } = await supabase
    .from("hires")
    .select("id, agent_id, budget_human, job_id, tx_hash, mode, created_at")
    .ilike("wallet_address", walletAddress)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    agentId: r.agent_id,
    budgetHuman: r.budget_human,
    jobId: r.job_id,
    txHash: r.tx_hash,
    mode: r.mode,
    createdAt: r.created_at,
  }));
}
