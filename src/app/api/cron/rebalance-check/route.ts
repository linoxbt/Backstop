import { timingSafeEqual } from "node:crypto";
import { runAutoRebateCheck } from "@/lib/chain/autoRebate";

/**
 * Authenticated endpoint for the scheduled breach check (see
 * .github/workflows/rebalance-breach-check.yml) — evaluates every real
 * agent's actual assurance-band status (src/lib/chain/bandBreach.ts) and
 * pays a real, per-hire rebate from the assurance pool for every breached
 * agent's unrebated hires. Never called from a page render; only from the
 * authenticated cron job.
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
  const result = await runAutoRebateCheck();
  return Response.json(result);
}
