/**
 * Run one real ERC-8183 hire against a real agent and time it — for
 * collecting genuine measurements toward the TermiX Agent Advantage Report
 * (src/app/advantage-report/page.tsx), which currently has bracketed
 * placeholders instead of real numbers ("[fill in: ...]"). This script
 * doesn't fabricate anything — it turns "run one of the 3 required real
 * tasks" into a single command instead of a manual research chore, and
 * prints a real elapsed time + real tx hash you can paste straight into
 * the report.
 *
 * Run with: npx tsx scripts/run-advantage-task.ts <agentId> [budgetHuman]
 * Example:  npx tsx scripts/run-advantage-task.ts meridian-rebalancer 2500
 *
 * Needs PRIVATE_KEY + WALLET_PASSWORD in .env.local (same as the web app's
 * own hire flow — src/lib/chain/hireAgent.ts) and a real, currently-running
 * agent at the target's providerAddress (agents/<name>, deployed via
 * `bag deploy`) — otherwise this creates a real funded job that nothing
 * will ever fulfill, the same caveat the web app's own hire button has.
 *
 * This only measures the *hiring* side (job creation → funded on-chain),
 * not full task completion — that also depends on the seller agent actually
 * delivering, which can take up to its dispute window. The "quality"
 * column of the Advantage Report still needs filling in by hand once a
 * hired job's cycle actually settles.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { ERC8183Client, EVMWalletProvider, JobStatus } from "@bnbagent/sdk";
import { getAgent } from "@/lib/agents";
import { parseBudgetToRaw } from "@/lib/budget";

async function main() {
  const [, , agentId, budgetHuman = "2500"] = process.argv;
  if (!agentId) {
    console.error("Usage: npx tsx scripts/run-advantage-task.ts <agentId> [budgetHuman]");
    console.error("Example: npx tsx scripts/run-advantage-task.ts meridian-rebalancer 2500");
    process.exit(1);
  }

  const agent = getAgent(agentId);
  if (!agent) {
    console.error(`No agent with id "${agentId}" in src/lib/agents.ts.`);
    process.exit(1);
  }
  if (!agent.providerAddress) {
    console.error(`${agent.name} has no real providerAddress — this would only ever simulate.`);
    process.exit(1);
  }

  const privateKey = process.env.PRIVATE_KEY;
  const walletPassword = process.env.WALLET_PASSWORD;
  if (!walletPassword || (!privateKey && !EVMWalletProvider.keystoreExists())) {
    console.error("Set PRIVATE_KEY and WALLET_PASSWORD in .env.local first (see .env.example).");
    process.exit(1);
  }

  console.log(`Hiring ${agent.name} (${agent.providerAddress}) with a ${budgetHuman} U budget…`);
  const startedAt = Date.now();

  const wallet = new EVMWalletProvider({ password: walletPassword, privateKey: privateKey || undefined });
  const client = await ERC8183Client.create({ walletProvider: wallet, network: "bsc-testnet" });

  const decimals = await client.tokenDecimals();
  const parsed = parseBudgetToRaw(budgetHuman, decimals);
  if (!parsed.ok) {
    console.error(parsed.error);
    process.exit(1);
  }

  const disputeWindow = await client.policy.disputeWindow();
  const expiredAt = BigInt(Math.floor(Date.now() / 1000)) + disputeWindow + BigInt(600);

  const created = await client.createJob({
    provider: agent.providerAddress,
    expiredAt,
    description: `Advantage report task — ${agent.name}`,
  });
  if (created.jobId === null) throw new Error("createJob did not return a jobId");

  await client.registerJob(created.jobId);
  await client.setBudget(created.jobId, parsed.raw);
  const funded = await client.fund(created.jobId, parsed.raw);
  const job = await client.getJob(created.jobId);

  const elapsedMs = Date.now() - startedAt;
  const txHash = funded.transactionHash ?? created.transactionHash;
  const elapsedHuman = `${(elapsedMs / 1000).toFixed(1)}s`;

  const result = {
    agent: agent.name,
    agentId: agent.id,
    budgetHuman,
    jobId: created.jobId.toString(),
    status: JobStatus[job.status],
    txHash,
    explorerUrl: txHash ? `https://testnet.bscscan.com/tx/${txHash}` : undefined,
    elapsedMs,
    elapsedHuman,
    ranAt: new Date().toISOString(),
  };

  console.log("\n--- Real task result ---");
  console.log(JSON.stringify(result, null, 2));
  console.log("\nFor advantage-report/page.tsx's ROWS, the agent side of this task:");
  console.log(`  time: "${elapsedHuman} hands-on to hire (job creation → funded on-chain)"`);
  console.log(`  cost: "${agent.feeModel}"`);
  console.log(`  quality: fill in once this job's cycle actually settles — not yet measurable here`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
