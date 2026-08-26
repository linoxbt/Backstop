create table hires (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  agent_id text not null,
  budget_human text not null,
  job_id text,
  tx_hash text,
  mode text not null check (mode in ('live', 'simulated')),
  auth_message text not null,
  auth_signature text not null,
  created_at timestamptz not null default now()
);

create index hires_wallet_address_idx on hires (lower(wallet_address));

alter table hires enable row level security;

-- Anyone can read hires (needed for the client-side My Agents page to
-- look up records by connected wallet).
--
-- The "public insert" policy below is intentionally provisional: it lets
-- anyone holding the (deliberately public) publishable key insert an
-- arbitrary row directly via the Supabase REST API -- fake agent_id/
-- job_id/tx_hash, or even a forged auth_message/auth_signature pair --
-- completely bypassing the app's own viem.verifyMessage() check, which
-- only guards the app's own code path, not the table itself. It is dropped
-- by the very next migration (restrict_hires_insert.sql) once the
-- service-role write path (recordHire in src/lib/chain/hires.ts) exists;
-- it's created here only so this migration is independently valid to run
-- on its own, never because a permissive insert policy is an acceptable
-- end state.
create policy "public read" on hires for select using (true);
create policy "public insert" on hires for insert with check (true);
