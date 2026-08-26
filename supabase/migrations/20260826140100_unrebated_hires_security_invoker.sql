-- Supabase's security advisor flagged `unrebated_hires` as a SECURITY
-- DEFINER-equivalent view (runs with its creator's privileges rather than
-- the querying role's) -- the modern fix is security_invoker, which makes
-- the view respect the querying role's own RLS instead. This view is only
-- ever read via the service-role client (src/lib/chain/hires.ts's
-- getUnrebatedHiresForAgent), which bypasses RLS by construction either
-- way, so this changes nothing about how the app actually uses it -- it's
-- closing the gap for any other role that might ever query it directly.
alter view unrebated_hires set (security_invoker = true);
