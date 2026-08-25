/**
 * Revoke the assurance pool's Altana payout session immediately.
 *
 * Run with: npx tsx scripts/revoke-altana-pool.ts
 *
 * Needs ALTANA_ADMIN_PRIVATE_KEY (the same admin wallet that granted the
 * session — see provision-altana-pool.ts) and ALTANA_SESSION (the session
 * to revoke, base64-encoded — see provision-altana-pool.ts's doc comment
 * for why). Free at the protocol level (gas only); effect is immediate —
 * the session's next execute fails at the on-chain validator. Kept as an
 * admin-only script rather than a public button: this app has no auth
 * layer, and a revoke control reachable by any visitor would be a real
 * denial-of-service risk against the pool's own payout path.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { AltanaWalletProvider, deserializeSession } from "@bnbagent/sdk/wallets";

async function main() {
  const privateKey = process.env.ALTANA_ADMIN_PRIVATE_KEY;
  const sessionEncoded = process.env.ALTANA_SESSION;
  if (!privateKey || !sessionEncoded) {
    console.error("Set ALTANA_ADMIN_PRIVATE_KEY and ALTANA_SESSION in .env.local first.");
    process.exit(1);
  }

  const admin = new AltanaWalletProvider({ privateKey, network: "bnb-testnet" });
  const session = await deserializeSession(Buffer.from(sessionEncoded, "base64").toString("utf8"));

  const result = await admin.revokeSession(session);
  console.log("Session revoked.");
  console.log(`Tx: https://testnet.bscscan.com/tx/${result.transactionHash}`);
  console.log("\nRemove ALTANA_SESSION from your env now — it no longer works.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
