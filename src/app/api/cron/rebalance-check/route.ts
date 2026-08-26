import { timingSafeEqual } from "node:crypto";
import { runAutoRebateCheck } from "@/lib/chain/autoRebate";
import { getLivePoolState, TESTNET_TOKENS } from "@/lib/pancakeswap";
import { recordPoolSnapshot } from "@/lib/chain/poolSnapshots";

/**
 * Authenticated endpoint for the scheduled breach check (see
 * .github/workflows/rebalance-breach-check.yml) — evaluates every real
 * agent's actual assurance-band status (src/lib/chain/bandBreach.ts) and
 * pays a real, per-hire rebate from the assurance pool for every breached
 * agent's unrebated hires. Never called from a page render; only from the
 * authenticated cron job.
 *
 * Also records one real PancakeSwap pool telemetry snapshot per run (see
 * src/lib/chain/poolSnapshots.ts) — piggybacking on this endpoint's existing
 * 30-minute schedule and auth rather than standing up a second cron, since
 * this is purely an additional read+insert with no payout risk of its own.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 501 });
  }
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [result, pool] = await Promise.all([
    runAutoRebateCheck(),
    getLivePoolState(TESTNET_TOKENS.WBNB, TESTNET_TOKENS.USDT),
  ]);
  const snapshot = pool ? await recordPoolSnapshot(pool) : { ok: false, error: "No live pool found" };
  return Response.json({ ...result, poolSnapshot: snapshot });
}
