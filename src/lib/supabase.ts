import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Publishable key — safe to expose client-side by design. Row Level
 * Security on the `hires`/`rebates` tables (see supabase/migrations) is what
 * actually gates access, not this key's secrecy: both tables are public-read,
 * insert-only-via-service-role (see `supabaseAdmin` below). This module is
 * only ever imported from "use server" files today (never a client
 * component directly), but it's guarded with `server-only` anyway now that
 * it also holds the service-role key.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;

/**
 * Service-role client — bypasses Row Level Security entirely. This is what
 * makes the RLS tightening in the restrict_hires_insert migration actually
 * work: `hires`/`rebates` have no public insert policy, so only this client
 * (never the publishable-key client above) can write a row. Anyone holding
 * the public `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can no longer forge a
 * hire or rebate record directly against the Supabase REST API.
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;
