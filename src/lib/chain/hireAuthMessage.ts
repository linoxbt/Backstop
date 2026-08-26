export function buildHireAuthMessage(params: {
  agentId: string;
  agentName: string;
  budgetHuman: string;
  walletAddress: string;
}): string {
  return [
    "Backstop hire authorization",
    `Agent: ${params.agentName} (${params.agentId})`,
    `Budget: ${params.budgetHuman} U`,
    `Wallet: ${params.walletAddress}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n");
}

const AUTH_MESSAGE_MAX_AGE_SECONDS = 5 * 60;

/**
 * True only for a message signed within the last 5 minutes, with no future
 * timestamp. Plain, synchronous, and pure on purpose — src/lib/chain/hires.ts
 * is a "use server" file, and Next.js requires every export from one to be
 * an async server action, so this staleness check lives here instead where
 * it can also be unit-tested directly without pulling in Supabase.
 */
export function messageIsFresh(message: string): boolean {
  const match = message.match(/^Time: (.+)$/m);
  if (!match) return false;
  const issuedAt = Date.parse(match[1]);
  if (Number.isNaN(issuedAt)) return false;
  const ageSeconds = (Date.now() - issuedAt) / 1000;
  // Reject both a stale replay and a message claiming a future timestamp
  // (a clock-skewed or deliberately backdated/forwarded signature).
  return ageSeconds >= 0 && ageSeconds <= AUTH_MESSAGE_MAX_AGE_SECONDS;
}
