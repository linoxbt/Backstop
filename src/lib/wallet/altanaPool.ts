import "server-only";
import { createPublicClient, erc20Abi, http, type Address } from "viem";
import { bscTestnet } from "viem/chains";
import { AltanaWalletProvider } from "@bnbagent/sdk/wallets";
import { getAddress, BSC_TESTNET_CHAIN_ID } from "@bnbagent/sdk/networks";

/**
 * The assurance pool's payout session: an Altana session key whose only
 * on-chain power is `transfer(address,uint256)` on the payment token, up
 * to a daily spend cap. Provisioned once via scripts/provision-altana-pool.ts
 * (see .env.example) — this module only ever operates the already-granted
 * session, never the admin key.
 */

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
  if (!process.env.ALTANA_SESSION) {
    return {
      ok: false,
      mode: "unconfigured",
      error: "ALTANA_SESSION not set — run scripts/provision-altana-pool.ts first.",
    };
  }

  try {
    const sessionWallet = await AltanaWalletProvider.sessionFromEnv({ network: "bnb-testnet" });
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

/** Read-only session summary for the /pool page — never touches the chain. */
export async function getPoolSessionInfo(): Promise<PoolSessionInfo> {
  if (!process.env.ALTANA_SESSION) return { configured: false };
  try {
    const raw = JSON.parse(process.env.ALTANA_SESSION) as {
      walletAddress?: string;
      expiry?: number;
      permissions?: {
        calls?: { signature?: string }[];
        spend?: { limit?: string; period?: string }[];
      };
    };
    const spend = raw.permissions?.spend?.[0];
    return {
      configured: true,
      walletAddress: raw.walletAddress,
      expiry: raw.expiry,
      callAllowlist: raw.permissions?.calls?.map((c) => c.signature ?? "").filter(Boolean),
      spendCap: spend ? `${spend.limit} / ${spend.period}` : undefined,
    };
  } catch {
    return { configured: false };
  }
}
