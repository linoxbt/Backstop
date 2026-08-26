export const POOL = {
  tvl: "$1,842,300",
  tvlUnit: "BSC Mainnet",
  payoutRatio: "3.1%",
  payoutRatioNote: "trailing 90 days",
  solvencyBuffer: "18.4×",
  solvencyBufferNote: "worst single-day payout, covered",
  totalRebatesPaid: "$57,140",
  totalRebatesCount: 214,
  vaultAddress: "0x3F2a...9C4E",
  session: {
    callAllowlist: ["payout(address,uint256,bytes32)"],
    spendCap: "12,000 U / 24h",
    expiry: "renews every 24h, auto-revokes on anomaly",
    registeredIn: "Altana Keystore",
  },
};

export interface RebateLogEntry {
  id: string;
  agent: string;
  category: string;
  clause: string;
  amount: string;
  reason: string;
  time: string;
  txHash: string;
}

export const REBATE_LOG: RebateLogEntry[] = [
  {
    id: "r-214",
    agent: "Sentry HF",
    category: "Health Factor",
    clause: "Clause 6(b)",
    amount: "0.31 BNB",
    reason: "HF fell to 1.22 against a 1.35 floor",
    time: "6 minutes ago",
    txHash: "0x91fa...2b0c",
  },
  {
    id: "r-213",
    agent: "Cistern Yield",
    category: "Yield",
    clause: "Clause 4(c)",
    amount: "1.10% deposit credit",
    reason: "Realized 6.60% APY against a 7.8% floor",
    time: "41 minutes ago",
    txHash: "0x4d2c...e91a",
  },
  {
    id: "r-212",
    agent: "Tideline Grid",
    category: "Grid Trading",
    clause: "Clause 14(a)",
    amount: "0.42% of position value",
    reason: "Realized 4.10% cycle return against a 6.2% floor",
    time: "2 hours ago",
    txHash: "0x7b90...1fd3",
  },
  {
    id: "r-211",
    agent: "Meridian Rebalancer",
    category: "Rebalancing",
    clause: "Clause 12(a)",
    amount: "0.4% of position value",
    reason: "51 bps saved against a 55 bps floor during a low-volatility week",
    time: "5 hours ago",
    txHash: "0x2ae4...c710",
  },
  {
    id: "r-210",
    agent: "Sentry HF",
    category: "Health Factor",
    clause: "Clause 5(b)",
    amount: "0.18 BNB",
    reason: "HF fell to 1.29 against a 1.35 floor",
    time: "1 day ago",
    txHash: "0xf031...88be",
  },
];
