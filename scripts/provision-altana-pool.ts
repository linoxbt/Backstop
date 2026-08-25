/**
 * One-time setup for the assurance pool's Altana payout session.
 *
 * Run once with: npx tsx scripts/provision-altana-pool.ts
 *
 * Reads ALTANA_ADMIN_PRIVATE_KEY (a dedicated, funded-with-testnet-BNB-only
 * admin wallet — never reuse a wallet that holds anything else) and grants
 * a session scoped to exactly one power: transfer() on the payment token,
 * capped at ALTANA_POOL_DAILY_CAP per day. Registers the session in the
 * Altana Keystore (default `register: true` — costs ~$0.50 in native BNB
 * from the admin wallet, paid once here).
 *
 * Prints the ALTANA_SESSION value to set in .env.local / Netlify env vars.
 * The admin key is never needed again for day-to-day payouts — only for a
 * future re-provision or revokeSession().
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { AltanaWalletProvider, serializeSession } from "@bnbagent/sdk/wallets";
import { getAddress, BSC_TESTNET_CHAIN_ID } from "@bnbagent/sdk/networks";

async function main() {
  const privateKey = process.env.ALTANA_ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Set ALTANA_ADMIN_PRIVATE_KEY in .env.local first (see .env.example).");
    process.exit(1);
  }

  const dailyCap = BigInt(process.env.ALTANA_POOL_DAILY_CAP ?? "500000000000000000000");
  const paymentToken = getAddress(BSC_TESTNET_CHAIN_ID).paymentToken;

  const admin = new AltanaWalletProvider({ privateKey, network: "bnb-testnet" });
  console.log(`Admin wallet: ${admin.address}`);
  console.log(`Payment token: ${paymentToken}`);
  console.log(`Daily cap: ${dailyCap} raw units`);

  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days

  const session = await admin.grantSession({
    permissions: {
      calls: [{ signature: "transfer(address,uint256)", to: paymentToken }],
      spend: [{ limit: dailyCap, period: "day", token: paymentToken }],
    },
    expiry,
    register: true,
  });

  console.log("\nSession granted and registered in the Altana Keystore.");
  console.log(`Session wallet address: ${session.walletAddress}`);
  console.log(`Expires: ${new Date(expiry * 1000).toISOString()}`);
  console.log("\nSet this in .env.local / Netlify env vars:\n");
  console.log(`ALTANA_SESSION=${serializeSession(session)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
