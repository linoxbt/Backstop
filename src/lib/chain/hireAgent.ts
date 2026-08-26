"use server";

import { headers } from "next/headers";
import { ERC8183Client, EVMWalletProvider, JobStatus } from "@bnbagent/sdk";
import { checkRateLimitPersistent } from "@/lib/rateLimit";
import { parseBudgetToRaw } from "@/lib/budget";

// Floor against a script (or an impatient retry loop) hammering this real
// on-chain-spending action — see src/lib/rateLimit.ts. Backed by Postgres
// (checkRateLimitPersistent) when Supabase is configured, so it actually
// coordinates across serverless instances and survives a cold start; falls
// back to the in-memory limiter otherwise.
const HIRE_COOLDOWN_SECONDS = 15;

/** Either preset the SDK's ERC8183Client accepts. */
export type BnbNetwork = "bsc-testnet" | "bsc-mainnet";

function explorerBase(network: BnbNetwork): string {
  return network === "bsc-mainnet" ? "https://bscscan.com" : "https://testnet.bscscan.com";
}

export interface HireResult {
  ok: boolean;
  /**
   * "live" — actually went to BSC Testnet.
   * "simulated" — no wallet/provider configured; caller should fall back
   * to the illustrative stepper.
   */
  mode: "live" | "simulated";
  jobId?: string;
  status?: string;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Hire an agent through the real ERC-8183 flow: createJob -> registerJob ->
 * fund -> getJob, on either `bsc-testnet` (the default, and the only network
 * Backstop's own catalog agents are verified against) or `bsc-mainnet` (for
 * hiring an arbitrary agent discovered from the live ERC-8004 registry —
 * see DiscoveredAgentHire.tsx). Per the SDK's own docs, bsc-testnet writes
 * are gas-sponsored; bsc-mainnet writes self-pay real gas from the hirer
 * wallet, same as any other mainnet transaction.
 *
 * Requires PRIVATE_KEY + WALLET_PASSWORD (the hirer's wallet) and a real
 * on-chain provider address, either on the agent itself or via
 * DEMO_PROVIDER_ADDRESS for a wiring smoke test. Missing either falls
 * back to `mode: "simulated"` rather than throwing, so the UI can keep
 * working without credentials.
 */
export async function hireAgentOnChain(
  agentProviderAddress: string | undefined,
  budgetHuman: string,
  network: BnbNetwork = "bsc-testnet",
): Promise<HireResult> {
  const providerAddress = agentProviderAddress ?? process.env.DEMO_PROVIDER_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const walletPassword = process.env.WALLET_PASSWORD;

  const requestHeaders = await headers();
  // x-nf-client-connection-ip is set by Netlify's own edge and can't be
  // spoofed by the client (unlike x-forwarded-for, which any caller can set
  // to an arbitrary value to rotate past this limiter for free). Falls back
  // to x-forwarded-for for local dev, where Netlify's header won't be
  // present at all.
  const callerKey =
    requestHeaders.get("x-nf-client-connection-ip") ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
  const rateLimit = await checkRateLimitPersistent(`hire:${callerKey}`, HIRE_COOLDOWN_SECONDS);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      mode: "simulated",
      error: `Too many hire attempts. Wait ${rateLimit.retryAfterSeconds}s and try again.`,
    };
  }

  if (!providerAddress) {
    return {
      ok: false,
      mode: "simulated",
      error:
        "This agent has no live onchain provider address yet. Set providerAddress on it, or DEMO_PROVIDER_ADDRESS for a wiring smoke test.",
    };
  }
  if (!privateKey && !EVMWalletProvider.keystoreExists()) {
    return {
      ok: false,
      mode: "simulated",
      error: "No hirer wallet configured. Set PRIVATE_KEY and WALLET_PASSWORD.",
    };
  }
  if (!walletPassword) {
    return {
      ok: false,
      mode: "simulated",
      error: "WALLET_PASSWORD is required to unlock the hirer wallet keystore.",
    };
  }

  // Fast-fail on an obviously-bad budget before touching the network at
  // all — the exact raw-unit conversion (which needs the token's real
  // decimals) happens below once the client is created.
  const preflight = parseBudgetToRaw(budgetHuman, 18);
  if (!preflight.ok) {
    return { ok: false, mode: "simulated", error: preflight.error };
  }

  try {
    const wallet = new EVMWalletProvider({
      password: walletPassword,
      privateKey: privateKey || undefined,
    });
    const client = await ERC8183Client.create({
      walletProvider: wallet,
      network,
    });

    const decimals = await client.tokenDecimals();
    const parsed = parseBudgetToRaw(budgetHuman, decimals);
    if (!parsed.ok) {
      return { ok: false, mode: "simulated", error: parsed.error };
    }
    const budgetRaw = parsed.raw;
    const disputeWindow = await client.policy.disputeWindow();
    const expiredAt = BigInt(Math.floor(Date.now() / 1000)) + disputeWindow + BigInt(600);

    const created = await client.createJob({
      provider: providerAddress,
      expiredAt,
      description: "Backstop hire, funded via marketplace",
    });
    if (created.jobId === null) {
      throw new Error("createJob did not return a jobId");
    }

    await client.registerJob(created.jobId);
    // fund()'s amount is only a confirmation against a budget the job must
    // already carry — omitting this call reverts fund() with ZeroBudget
    // (found by running the real flow end-to-end on BSC Testnet).
    await client.setBudget(created.jobId, budgetRaw);
    const funded = await client.fund(created.jobId, budgetRaw);
    const job = await client.getJob(created.jobId);
    const txHash = funded.transactionHash ?? created.transactionHash;

    return {
      ok: true,
      mode: "live",
      jobId: created.jobId.toString(),
      status: JobStatus[job.status],
      txHash,
      explorerUrl: txHash ? `${explorerBase(network)}/tx/${txHash}` : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "live",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export interface SettleResult {
  ok: boolean;
  mode: "live" | "simulated";
  jobId?: string;
  status?: string;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Settle a real ERC-8183 job — `ERC8183Client.settle(jobId)` is
 * "permissionless" (the SDK's own description): it pulls the policy's
 * verdict and applies it on-chain, and can be called by any wallet once the
 * job is past its dispute window (silence approves under the deployed
 * OptimisticPolicy). Reuses the same hirer-side wallet as hireAgentOnChain
 * only because that's the funded wallet this app already has for gas — the
 * call itself doesn't require being the original hirer.
 *
 * Will genuinely revert (and surface the real chain error) if the job isn't
 * actually in a settleable state yet (still FUNDED, not yet SUBMITTED, or
 * still inside its dispute window) — that's not a bug to hide, it's the
 * real contract enforcing the real rule.
 */
export async function settleJobOnChain(
  jobId: string,
  network: BnbNetwork = "bsc-testnet",
): Promise<SettleResult> {
  const privateKey = process.env.PRIVATE_KEY;
  const walletPassword = process.env.WALLET_PASSWORD;

  const requestHeaders = await headers();
  const callerKey =
    requestHeaders.get("x-nf-client-connection-ip") ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
  const rateLimit = await checkRateLimitPersistent(`settle:${callerKey}`, HIRE_COOLDOWN_SECONDS);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      mode: "simulated",
      error: `Too many settle attempts. Wait ${rateLimit.retryAfterSeconds}s and try again.`,
    };
  }

  if (!privateKey && !EVMWalletProvider.keystoreExists()) {
    return { ok: false, mode: "simulated", error: "No settlement wallet configured. Set PRIVATE_KEY and WALLET_PASSWORD." };
  }
  if (!walletPassword) {
    return { ok: false, mode: "simulated", error: "WALLET_PASSWORD is required to unlock the wallet keystore." };
  }

  let parsedJobId: bigint;
  try {
    parsedJobId = BigInt(jobId);
  } catch {
    return { ok: false, mode: "simulated", error: "Invalid job id." };
  }

  try {
    const wallet = new EVMWalletProvider({ password: walletPassword, privateKey: privateKey || undefined });
    const client = await ERC8183Client.create({ walletProvider: wallet, network });

    const settled = await client.settle(parsedJobId);
    const job = await client.getJob(parsedJobId);

    return {
      ok: true,
      mode: "live",
      jobId,
      status: JobStatus[job.status],
      txHash: settled.transactionHash,
      explorerUrl: settled.transactionHash
        ? `${explorerBase(network)}/tx/${settled.transactionHash}`
        : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "live",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
