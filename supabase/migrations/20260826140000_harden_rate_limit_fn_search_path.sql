-- Supabase's own security advisor flagged check_rate_limit() as having a
-- mutable search_path -- a classic Postgres hardening gap: without a fixed
-- search_path, a function is vulnerable to search_path hijacking if a
-- caller can get an object of the same name resolved from an earlier
-- schema in their session's path than the one the function author intended.
-- Pinning it costs nothing (the function only ever touches
-- public.rate_limits) and closes the gap outright.
alter function check_rate_limit(text, int) set search_path = public, pg_temp;
