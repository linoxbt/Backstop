import "server-only";
import { createPublicClient, erc20Abi, formatUnits, http, type Address } from "viem";
import { bscTestnet } from "viem/chains";
import { AltanaWalletProvider, deserializeSession } from "@bnbagent/sdk/wallets";
import { getAddress, BSC_TESTNET_CHAIN_ID } from "@bnbagent/sdk/networks";

/**
 * The assurance pool's payout session: an Altana session key whose only
 * on-chain power is `transfer(address,uint256)` on the payment token, up
 * to a daily spend cap. Provisioned once via scripts/provision-altana-pool.ts
 * (see .env.example) — this module only ever operates the already-granted
 * session, never the admin key.
 *
 * ALTANA_SESSION is stored base64-encoded, not as raw JSON. Next.js's own
 * .env loader (@next/env, via dotenv-expand) applies shell-style `$VAR`
 * interpolation to every .env* value — and serializeSession() always
 * encodes bigints as a literal `{"$bigint": "..."}` key, which dotenv-expand
 * silently rewrites to `{"": "..."}` (it treats `$bigint` as a reference to
 * an undefined env var and substitutes empty string). Confirmed directly:
 * reading ALTANA_SESSION through @next/env's loadEnvConfig() produces
 * `limit":{"":"500000000000000000000"}` instead of the real
 * `{"$bigint": "500000000000000000000"}` — silently corrupting every
 * session's spend permission. Base64 has no `$` in its alphabet, so it
 * passes through dotenv-expand untouched regardless of what the decoded
 * JSON contains.
 */

function decodeSessionEnv(): string | null {
  const encoded = process.env.ALTANA_SESSION;
  if (!encoded) return null;
  try {
    return Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export interface PayRebateResult {
  ok: boolean;
  mode: "live" | "unconfigured";
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

function paymentTokenAddress(): Address {
  return getAddress(BSC_TESTNET_CHAIN_ID).paymentToken;
}

/**
 * Pay a rebate from the assurance pool's Altana session to `to`. Requires
 * ALTANA_SESSION (see scripts/provision-altana-pool.ts) — without it,
 * returns `{ mode: "unconfigured" }` rather than throwing, so callers can
 * fall back to an illustrative UI state the same way hireAgent.ts does.
 */
export async function payRebate(
  to: Address,
  amountRaw: bigint,
  note: string,
): Promise<PayRebateResult> {
  const serialized = decodeSessionEnv();
  if (!serialized) {
    return {
      ok: false,
      mode: "unconfigured",
      error: "ALTANA_SESSION not set — run scripts/provision-altana-pool.ts first.",
    };
  }

  try {
    // Deserialize + construct directly rather than AltanaWalletProvider
    // .sessionFromEnv(), which reads process.env.ALTANA_SESSION itself —
    // we already decoded it above and must not hand it a second,
    // dotenv-expand-mangled read of the same env var.
    const session = await deserializeSession(serialized);
    const sessionWallet = new AltanaWalletProvider({ session, network: "bnb-testnet" });
    const client = createPublicClient({ chain: bscTestnet, transport: http() });
    const executor = sessionWallet.makeExecutor({ client });

    const result = await executor.execute({
      description: note,
      call: {
        address: paymentTokenAddress(),
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, amountRaw],
      },
    });

    return {
      ok: true,
      mode: "live",
      txHash: result.transactionHash,
      explorerUrl: `https://testnet.bscscan.com/tx/${result.transactionHash}`,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "live",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export interface PoolSessionInfo {
  configured: boolean;
  walletAddress?: string;
  expiry?: number;
  callAllowlist?: string[];
  spendCap?: string;
}

/**
 * serializeSession() (from @bnbagent/sdk/wallets) encodes every bigint —
 * including permissions.spend[].limit — as `{ "$bigint": "<decimal>" }`,
 * never as a plain string or number. Unwrap that shape (or accept a plain
 * string/number, in case a future SDK version serializes differently)
 * rather than assuming a shape that doesn't match what the SDK actually
 * writes to ALTANA_SESSION.
 */
function unwrapBigint(value: unknown): bigint | null {
  if (typeof value === "string" || typeof value === "number") {
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }
  if (value !== null && typeof value === "object" && "$bigint" in value) {
    const encoded = (value as { $bigint: unknown }).$bigint;
    if (typeof encoded === "string") {
      try {
        return BigInt(encoded);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Read-only session summary for the /pool page — never touches the chain. */
export async function getPoolSessionInfo(): Promise<PoolSessionInfo> {
  const serialized = decodeSessionEnv();
  if (!serialized) return { configured: false };
  try {
    const raw = JSON.parse(serialized) as {
      walletAddress?: string;
      expiry?: number;
      permissions?: {
        calls?: { signature?: string }[];
        spend?: { limit?: unknown; period?: string }[];
      };
    };
    const spend = raw.permissions?.spend?.[0];
    const limit = spend ? unwrapBigint(spend.limit) : null;
    // The pool's payout session is always denominated in the ERC-8183
    // payment token ("U", 18 decimals) — same token every other on-chain
    // read/write in this app assumes. This function is deliberately
    // network-free (see doc comment above), so decimals can't be fetched
    // live here; 18 is not a guess, it's this token's known, fixed value.
    const spendCap = spend && limit !== null ? `${formatUnits(limit, 18)} U / ${spend.period}` : undefined;
    return {
      configured: true,
      walletAddress: raw.walletAddress,
      expiry: raw.expiry,
      callAllowlist: raw.permissions?.calls?.map((c) => c.signature ?? "").filter(Boolean),
      spendCap,
    };
  } catch {
    return { configured: false };
  }
}
