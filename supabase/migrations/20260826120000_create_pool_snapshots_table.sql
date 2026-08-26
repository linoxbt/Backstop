-- Real, independently-observed PancakeSwap v3 pool telemetry, captured on the
-- same 30-minute cron already used for the auto-rebate check (see
-- src/app/api/cron/rebalance-check/route.ts). This is a genuinely live signal
-- (real tick/liquidity/price reads from the real WBNB/USDT v3 pool via
-- src/lib/pancakeswap.ts), which is what the honest-hacking findings this
-- session identified as missing: `AssuranceBand.realized` in src/lib/agents.ts
-- is static, hand-authored data, and this table does not overwrite or fake
-- that field -- it's a separate, clearly-labeled "live pool telemetry" strip
-- shown alongside it (see src/lib/chain/poolSnapshots.ts,
-- src/components/PoolTelemetry.tsx), never conflated with a claim about any
-- agent's own trading performance.
create table pool_snapshots (
  id uuid primary key default gen_random_uuid(),
  pool_address text not null,
  fee_tier integer not null,
  tick integer not null,
  liquidity text not null,
  price double precision not null,
  captured_at timestamptz not null default now()
);

create index pool_snapshots_pool_captured_idx on pool_snapshots (pool_address, captured_at desc);

alter table pool_snapshots enable row level security;

-- Public read (the agent dossier page shows this to any visitor). No public
-- insert policy -- only the service-role client (src/lib/supabase.ts's
-- supabaseAdmin, from the same authenticated cron path as autoRebate.ts) can
-- write a row.
create policy "public read" on pool_snapshots for select using (true);
