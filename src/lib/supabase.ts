import { createClient } from "@supabase/supabase-js";

/**
 * Publishable key — safe to expose client-side by design. Row Level
 * Security on the `hires` table (see the create_hires_table migration)
 * is what actually gates access, not this key's secrecy.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
