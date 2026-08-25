import "server-only";
import { createPublicClient, http, type Address } from "viem";
import { bscTestnet } from "viem/chains";

/**
 * Real, live reads against PancakeSwap v3's actual deployed contracts on
 * BSC Testnet — verified real addresses (v3 Factory + token contracts),
 * not invented ones. Never throws: a missing pool or an RPC failure
 * returns `null` so callers fall back cleanly, same pattern as every
 * other chain-touching module in this app.
 */

const V3_FACTORY: Address = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";

export const TESTNET_TOKENS = {
  WBNB: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd" as Address,
  USDT: "0x0fB5D7c73FA349A90392f873a4FA1eCf6a3d0a96" as Address,
  BUSD: "0x3304dd20f6Fe094Cb0134a6c8ae07EcE26c7b6A7" as Address,
} as const;

const FACTORY_ABI = [
  {
    name: "getPool",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "address" }, { type: "uint24" }],
    outputs: [{ type: "address" }],
  },
] as const;

const POOL_ABI = [
  {
    name: "slot0",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint32" },
      { name: "unlocked", type: "bool" },
    ],
  },
  { name: "liquidity", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint128" }] },
  { name: "token0", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "token1", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

const FEE_TIERS = [100, 500, 2500, 10000] as const;

function client() {
  return createPublicClient({
    chain: bscTestnet,
    transport: http(process.env.RPC_URL || "https://bsc-testnet-rpc.publicnode.com"),
  });
}

export interface PoolState {
  poolAddress: Address;
  feeTier: number;
  tick: number;
  liquidity: string;
  /** price of token1 per token0, unadjusted for decimals (both tokens here are 18dp) */
  price: number;
  token0: Address;
  token1: Address;
}

/**
 * Find the first live pool for `tokenA`/`tokenB` across the standard fee
 * tiers and read its current state directly from the pool contract. Real
 * on-chain data — no aggregator, no cached feed.
 */
export async function getLivePoolState(tokenA: Address, tokenB: Address): Promise<PoolState | null> {
  try {
    const c = client();
    for (const fee of FEE_TIERS) {
      const pool = await c.readContract({
        address: V3_FACTORY,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [tokenA, tokenB, fee],
      });
      if (pool === "0x0000000000000000000000000000000000000000") continue;

      const [slot0, liquidity, token0, token1] = await Promise.all([
        c.readContract({ address: pool, abi: POOL_ABI, functionName: "slot0" }),
        c.readContract({ address: pool, abi: POOL_ABI, functionName: "liquidity" }),
        c.readContract({ address: pool, abi: POOL_ABI, functionName: "token0" }),
        c.readContract({ address: pool, abi: POOL_ABI, functionName: "token1" }),
      ]);
      if (liquidity === BigInt(0)) continue;

      const [sqrtPriceX96, tick] = slot0;
      const price = (Number(sqrtPriceX96) / 2 ** 96) ** 2;

      return {
        poolAddress: pool,
        feeTier: fee,
        tick,
        liquidity: liquidity.toString(),
        price,
        token0,
        token1,
      };
    }
    return null;
  } catch {
    return null;
  }
}
