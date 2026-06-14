import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null until configured — the battle page falls back to a local preview so the
// app still builds and runs without Supabase credentials.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const supabaseConfigured = Boolean(url && key);
