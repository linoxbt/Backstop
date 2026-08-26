import { EVMWalletProvider } from "@bnbagent/sdk";

/**
 * Boolean-only config status for every piece of live wiring this app is
 * capable of, but which silently degrades to a simulated/illustrative
 * fallback when unconfigured (that degradation is honest — see every
 * module's own doc comments — but it means clicking around the deployed
 * site is the only way to notice a gap today). This endpoint exists so
 * that's a one-request check instead of a page-by-page hunt, exactly the
 * kind of gap a live evaluation of this app found: the hire flow silently
 * falling back to "simulated" because a hirer wallet wasn't configured, and
 * `/pool`'s session silently showing "Illustrative" because Altana wasn't
 * provisioned.
 *
 * Deliberately reveals presence only, never values — and reveals nothing
 * that isn't already independently observable from public pages today (a
 * simulated hire already reveals PRIVATE_KEY is unset; /pool's session
 * badge already reveals ALTANA_SESSION's state; this cron route's own
 * 401-vs-501 already reveals CRON_SECRET's state) — so consolidating those
 * same three facts plus a couple more into one endpoint doesn't create a
 * new information leak.
 */
export async function GET() {
  const hirerWalletConfigured =
    Boolean(process.env.PRIVATE_KEY) || EVMWalletProvider.keystoreExists();
  const hirerWalletPasswordConfigured = Boolean(process.env.WALLET_PASSWORD);

  return Response.json({
    hireFlow: {
      // hireAgentOnChain returns "live" only when both of these are set (or
      // a keystore already exists) — see src/lib/chain/hireAgent.ts.
      hirerWalletConfigured,
      hirerWalletPasswordConfigured,
      live: hirerWalletConfigured && hirerWalletPasswordConfigured,
    },
    assurancePool: {
      // getPoolSessionInfo/payRebate — src/lib/wallet/altanaPool.ts.
      altanaSessionConfigured: Boolean(process.env.ALTANA_SESSION),
    },
    hireRecords: {
      // src/lib/supabase.ts — publishable client (read) and service-role
      // client (write) are configured independently.
      publishableClientConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
      serviceRoleClientConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    walletConnect: {
      configured: Boolean(process.env.NEXT_PUBLIC_REOWN_PROJECT_ID),
    },
    autoRebateCron: {
      // Matches /api/cron/rebalance-check's own 401-vs-501 behavior —
      // surfaced here too for one-stop checking.
      cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    },
    erc8004Lookup: {
      // src/lib/erc8004.ts — works fine on 8004scan's anonymous tier with
      // no key at all; this only reflects whether the free Pro-tier
      // upgrade's key has been wired in, not whether the lookup works.
      proTierKeyConfigured: Boolean(process.env.EIGHT004SCAN_API_KEY),
    },
  });
}
