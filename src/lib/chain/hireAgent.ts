"use server";

import { headers } from "next/headers";
import { ERC8183Client, EVMWalletProvider, JobStatus } from "@bnbagent/sdk";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseBudgetToRaw } from "@/lib/budget";

// Best-effort floor against a script (or an impatient retry loop) hammering
// this action — see src/lib/rateLimit.ts for what this does and doesn't
// cover. Real protection for a wallet holding non-trivial funds needs
// infrastructure this project doesn't have configured; this just closes
// the "completely free to spam" gap.
const HIRE_COOLDOWN_SECONDS = 15;

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
 * Hire an agent through the real ERC-8183 flow on BSC Testnet:
 * createJob -> registerJob -> fund -> getJob.
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
): Promise<HireResult> {
  const providerAddress = agentProviderAddress ?? process.env.DEMO_PROVIDER_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const walletPassword = process.env.WALLET_PASSWORD;

  const requestHeaders = await headers();
  const callerKey = requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rateLimit = checkRateLimit(`hire:${callerKey}`, HIRE_COOLDOWN_SECONDS);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      mode: "simulated",
      error: `Too many hire attempts — wait ${rateLimit.retryAfterSeconds}s and try again.`,
    };
  }

  if (!providerAddress) {
    return {
      ok: false,
      mode: "simulated",
      error:
        "This agent has no live on-chain provider address yet — set providerAddress on it, or DEMO_PROVIDER_ADDRESS for a wiring smoke test.",
    };
  }
  if (!privateKey && !EVMWalletProvider.keystoreExists()) {
    return {
      ok: false,
      mode: "simulated",
      error: "No hirer wallet configured — set PRIVATE_KEY and WALLET_PASSWORD.",
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
      network: "bsc-testnet",
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
      description: "Backstop hire — funded via marketplace",
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
      explorerUrl: txHash ? `https://testnet.bscscan.com/tx/${txHash}` : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "live",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
