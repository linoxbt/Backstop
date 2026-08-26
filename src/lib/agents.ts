import type { Agent, AgentCategory, CategoryMeta } from "./types";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "rebalancing",
    label: "Rebalancing",
    clause: "Form A, LP Range Management",
    verb: "manages LP ranges, resets positions automatically",
    blurb:
      "LP ranges drift with price. Every agent here resets its range and writes the realized cost delta onchain, not an APR screenshot.",
  },
  {
    id: "grid-trading",
    label: "Grid Trading",
    clause: "Form B, Grid Order Management",
    verb: "places and manages automated grid orders",
    blurb:
      "Grid orders live or die on realized spread, not backtest. Every fill this cycle is in the manifest below the band.",
  },
  {
    id: "yield",
    label: "Yield Optimisation",
    clause: "Form C, Liquidity Routing",
    verb: "routes liquidity to the highest available APR",
    blurb:
      "A yield agent is judged on what it beats, not what it chased. Every APY shown here is checked against the manifest at settlement.",
  },
  {
    id: "health-factor",
    label: "Health Factor Monitoring",
    clause: "Form D, Liquidation Defense",
    verb: "protects lending positions from liquidation",
    blurb:
      "A health-factor agent only matters in the minutes before liquidation. Every band below is measured against real drawdowns, not calm markets.",
  },
];

export const AGENTS: Agent[] = [
  // ---------------- Rebalancing ----------------
  {
    id: "meridian-rebalancer",
    name: "Meridian Rebalancer",
    category: "rebalancing",
    tagline: "Resets your PancakeSwap v3 range before it drifts out of bounds.",
    description:
      "Meridian watches BNB/USDT and BNB/FDUSD concentrated positions on PancakeSwap v3 and re-centers them before price exits the fee-earning range, netting out gas and slippage against a static-range baseline.",
    operator: "Fielding Labs",
    agentId8004: "bnb:56 · agent #10281",
    network: "BSC Testnet",
    protocols: ["PancakeSwap v3"],
    feeModel: "0.4% of fees captured, 6% of that to the assurance pool",
    poolContribution: "6% of performance fee",
    cyclesCompleted: 182,
    hirers: 64,
    manifestHash: "0x7a41c0e2f4a6c8e0f2a4b6d8f0a2c4e6f8a0b2c4d6e8f0a2c4e6f8a0b2c4d6e8",
    jobStage: "SETTLED",
    providerAddress: "0xC06F59E8F20978718D474af884be896e8CFA6Bb0",
    endpoints: { a2a: true, mcp: false, x402: false },
    band: {
      symbol: "",
      unit: "bps saved vs. static range",
      scaleMin: 20,
      scaleMax: 140,
      historicalLow: 40,
      historicalHigh: 95,
      promisedLow: 55,
      promisedHigh: 85,
      realized: 71,
      cycleLabel: "Cycle 183",
      status: "within",
    },
  },

  // ---------------- Grid Trading ----------------
  {
    id: "tideline-grid",
    name: "Tideline Grid",
    category: "grid-trading",
    tagline: "Runs a 24-line grid on BNB/USDT, sized to realised volatility.",
    description:
      "Tideline Grid places and re-places limit orders across a band centred on recent realised volatility, harvesting the spread on BNB/USDT without taking a directional position.",
    operator: "Cordage Collective",
    agentId8004: "bnb:56 · agent #11004",
    network: "BSC Testnet",
    protocols: ["PancakeSwap v3"],
    feeModel: "1.1% of position value per cycle, 6% of that to the assurance pool",
    poolContribution: "6% of performance fee",
    cyclesCompleted: 118,
    hirers: 47,
    manifestHash: "0x4e2a6f0c1d8b3a7e2f905c1a44e0b7d3f8c1a9e0d2b4f6a8c0e2f4a6c8e0f2a4",
    jobStage: "SUBMITTED",
    providerAddress: "0x0c0f19e129b518fAF847b62C02695DcF326f10f3",
    endpoints: { a2a: true, mcp: false, x402: false },
    band: {
      symbol: "%",
      unit: "cycle return",
      scaleMin: 0,
      scaleMax: 12,
      historicalLow: 4.6,
      historicalHigh: 8.9,
      promisedLow: 6.2,
      promisedHigh: 8.4,
      realized: 4.1,
      cycleLabel: "Cycle 14 of 20",
      status: "breach",
      rebate: {
        amount: "0.42% of position value",
        clause: "Clause 14(a)",
        note: "Realized 4.10% fell 0.5 pt below the promised floor. The pool paid out against the same manifest hash shown at hire, no dispute filed.",
      },
    },
  },
  {
    id: "cordgrid",
    name: "Cordgrid",
    category: "grid-trading",
    tagline: "A tight, high-frequency grid built for BNB/USDT's usual range.",
    description:
      "Cordgrid runs a narrower grid than Tideline, rebalancing lines more often to stay inside typical daily volatility. Lower variance, lower ceiling.",
    operator: "Cordage Collective",
    agentId8004: "bnb:56 · agent #11005",
    network: "BSC Testnet",
    protocols: ["PancakeSwap v3"],
    feeModel: "0.9% of position value per cycle, 6% of that to the assurance pool",
    poolContribution: "6% of performance fee",
    cyclesCompleted: 210,
    hirers: 58,
    manifestHash: "0x2b4d6f8a0c2e4a6c8e0a2c4e6a8c0e2a4c6e8a0c2e4a6c8e0a2c4e6a8c0e2a4c",
    jobStage: "SETTLED",
    providerAddress: "0x504D861FDc4935Eb070B54cD271158164b3cc6B8",
    endpoints: { a2a: true, mcp: false, x402: false },
    band: {
      symbol: "%",
      unit: "cycle return",
      scaleMin: 0,
      scaleMax: 10,
      historicalLow: 4.0,
      historicalHigh: 8.6,
      promisedLow: 5.5,
      promisedHigh: 7.8,
      realized: 6.9,
      cycleLabel: "Cycle 211",
      status: "within",
    },
  },

  // ---------------- Yield ----------------
  {
    id: "cistern-yield",
    name: "Cistern Yield",
    category: "yield",
    tagline: "Routes idle stablecoins to the best verified APR across Venus and PancakeSwap.",
    description:
      "Cistern re-checks lending and LP yields every epoch and moves capital to whichever verified venue is paying the most, net of the gas cost of moving. Never chasing an unverified or momentary spike.",
    operator: "Reservoir Systems",
    agentId8004: "bnb:56 · agent #12203",
    network: "BSC Testnet",
    protocols: ["Venus", "PancakeSwap v3"],
    feeModel: "8% of yield earned, 6% of that to the assurance pool",
    poolContribution: "6% of performance fee",
    cyclesCompleted: 44,
    hirers: 133,
    manifestHash: "0x8f0a2c4e6a8c0e2a4c6e8a0c2e4a6c8e0a2c4e6a8c0e2a4c6e8a0c2e4a6c8e0a",
    jobStage: "SUBMITTED",
    providerAddress: "0x5828e1C532b897bCE6A0E45315a2C751789c447A",
    endpoints: { a2a: true, mcp: false, x402: false },
    band: {
      symbol: "%",
      unit: "APY",
      scaleMin: 0,
      scaleMax: 14,
      historicalLow: 6.9,
      historicalHigh: 9.8,
      promisedLow: 7.8,
      promisedHigh: 9.4,
      realized: 6.6,
      cycleLabel: "Epoch 4",
      status: "breach",
      rebate: {
        amount: "1.10% deposit credit",
        clause: "Clause 4(c)",
        note: "Realized 6.60% APY against a 7.8% floor. A Venus rate drop mid-epoch outpaced the routing agent's rebalance window.",
      },
    },
  },

  // ---------------- Health Factor ----------------
  {
    id: "sentry-hf",
    name: "Sentry HF",
    category: "health-factor",
    tagline: "Watches Venus positions block by block and de-risks before liquidation.",
    description:
      "Sentry monitors health factor on Venus borrow positions continuously and de-levers in stages as HF approaches its floor, aiming to keep hirers inside a promised safety band even through fast drawdowns.",
    operator: "Bastion Watch",
    agentId8004: "bnb:56 · agent #13051",
    network: "BSC Testnet",
    protocols: ["Venus"],
    feeModel: "0.15% of position value per month, 6% of that to the assurance pool",
    poolContribution: "6% of performance fee",
    cyclesCompleted: 2400,
    hirers: 76,
    manifestHash: "0xe0a2c4e6a8c0e2a4c6e8a0c2e4a6c8e0a2c4e6a8c0e2a4c6e8a0c2e4a6c8e0a2",
    jobStage: "SUBMITTED",
    providerAddress: "0x643c724b3F60b7973cffcE4FB4635Bb206111d47",
    endpoints: { a2a: true, mcp: false, x402: false },
    band: {
      symbol: "",
      unit: "HF maintained",
      scaleMin: 1.0,
      scaleMax: 1.9,
      historicalLow: 1.28,
      historicalHigh: 1.62,
      promisedLow: 1.35,
      promisedHigh: 1.55,
      realized: 1.22,
      cycleLabel: "Window 006",
      status: "breach",
      rebate: {
        amount: "0.31 BNB",
        clause: "Clause 6(b)",
        note: "HF dropped to 1.22 against a 1.35 floor during a fast margin move. The de-lever stage triggered late. Pool paid out before the position was four blocks old.",
      },
    },
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function agentsByCategory(category: string): Agent[] {
  return AGENTS.filter((a) => a.category === category);
}

export function categoryMeta(category: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === category);
}

/** True when `value` is a real category id — the one place that decides it. */
export function isCategory(value: string | undefined): value is AgentCategory {
  return CATEGORIES.some((c) => c.id === value);
}

export interface CatalogStats {
  agentCount: number;
  categoryCount: number;
  liveOnChainCount: number;
  totalHirers: number;
}

/**
 * Honest aggregate numbers for the marketplace's stat strip — sums of the
 * catalog's own listed fields, never a fabricated "live" figure. `hirers`
 * is the same illustrative per-agent number shown on every agent card
 * elsewhere in the app; `liveOnChainCount` is real (agents with a real
 * on-chain `providerAddress`).
 */
export function catalogStats(): CatalogStats {
  return {
    agentCount: AGENTS.length,
    categoryCount: CATEGORIES.length,
    liveOnChainCount: AGENTS.filter((a) => a.providerAddress).length,
    totalHirers: AGENTS.reduce((sum, a) => sum + a.hirers, 0),
  };
}
