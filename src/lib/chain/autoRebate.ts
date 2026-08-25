import "server-only";
import { EVMWalletProvider } from "@bnbagent/sdk";
import { checkRateLimit } from "@/lib/rateLimit";
import { payRebate, type PayRebateResult } from "@/lib/wallet/altanaPool";
import { checkRebalancerBreach } from "./rebalanceBreach";

/**
 * Fixed per-episode payout for the automated liquidity-breach checker — a
 * deliberately small, explicit amount distinct from the illustrative
 * percentage-based rebates shown in the static REBATE_LOG. 5 U at 18
 * decimals.
 */
const AUTO_REBATE_AMOUNT_RAW = BigInt("5000000000000000000");

// Once a breach has been paid, don't pay again for the same standing
// condition for a full day. This is an in-memory guard (see rateLimit.ts —
// it resets on a cold start, same caveat as everywhere else it's used in
// this app), so the real backstop against a double-pay storm is the
// Altana session's own on-chain daily spend cap set at provisioning time.
const AUTO_REBATE_COOLDOWN_SECONDS = 24 * 60 * 60;

export interface AutoRebateResult {
  breached: boolean;
  reason: string;
  paid: boolean;
  skippedReason?: string;
  payout?: PayRebateResult;
}

/**
 * Check the real, live breach condition and — if breached, and not already
 * paid for within the cooldown window — pay a real rebate from the
 * assurance pool's Altana session to the same wallet `hireAgentOnChain`
 * uses as the hirer, closing the loop with real components already wired
 * elsewhere in this app. Called from the authenticated cron route handler,
 * never from a page render.
 */
export async function runAutoRebateCheck(): Promise<AutoRebateResult> {
  const check = await checkRebalancerBreach();
  if (!check.breached) {
    return { breached: false, reason: check.reason, paid: false };
  }

  const cooldown = checkRateLimit("auto-rebate:meridian-rebalancer", AUTO_REBATE_COOLDOWN_SECONDS);
  if (!cooldown.allowed) {
    return {
      breached: true,
      reason: check.reason,
      paid: false,
      skippedReason: `Already paid out for this breach within the last 24h — retry after ${cooldown.retryAfterSeconds}s.`,
    };
  }

  const privateKey = process.env.PRIVATE_KEY;
  const walletPassword = process.env.WALLET_PASSWORD;
  if ((!privateKey && !EVMWalletProvider.keystoreExists()) || !walletPassword) {
    return {
      breached: true,
      reason: check.reason,
      paid: false,
      skippedReason: "No hirer wallet configured (PRIVATE_KEY/WALLET_PASSWORD) to receive the rebate.",
    };
  }

  const wallet = new EVMWalletProvider({ password: walletPassword, privateKey: privateKey || undefined });
  const payout = await payRebate(
    wallet.address,
    AUTO_REBATE_AMOUNT_RAW,
    "Automated check: no live PancakeSwap v3 WBNB/USDT liquidity found for Meridian Rebalancer",
  );

  return { breached: true, reason: check.reason, paid: payout.ok, payout };
}
