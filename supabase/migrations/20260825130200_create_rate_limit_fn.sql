-- A real, cross-instance rate limiter to back up src/lib/rateLimit.ts's
-- in-memory Map, which -- by its own doc comment -- resets on every cold
-- start and doesn't coordinate across serverless instances. This closes
-- that gap for the one action that actually spends real funds: hiring an
-- agent (src/lib/chain/hireAgent.ts).
--
-- One atomic statement per call: the `on conflict ... do update ... where`
-- clause only fires (and only then does `returning` produce a row) when the
-- key's last_call_at is already outside the window, so concurrent callers
-- racing on the same key are serialized by Postgres's own row lock -- no
-- separate read-then-write race window.
create table rate_limits (
  key text primary key,
  last_call_at timestamptz not null
);

create or replace function check_rate_limit(p_key text, p_window_seconds int)
returns boolean
language plpgsql
as $$
declare
  v_updated boolean;
begin
  insert into rate_limits (key, last_call_at)
  values (p_key, now())
  on conflict (key) do update
    set last_call_at = now()
    where rate_limits.last_call_at < now() - (p_window_seconds || ' seconds')::interval
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;
