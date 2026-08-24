"use server";

import { ERC8183Client, EVMWalletProvider, JobStatus } from "@bnbagent/sdk";

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

  const budget = Number(budgetHuman.replace(/,/g, ""));
  if (!Number.isFinite(budget) || budget <= 0) {
    return { ok: false, mode: "simulated", error: "Enter a valid budget." };
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
    const budgetRaw = BigInt(Math.round(budget * 10 ** decimals));
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
