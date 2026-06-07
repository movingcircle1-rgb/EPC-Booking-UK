import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing ${name}. Set it in the build env (.env.local for local builds).`);
  }
  return value;
}

/**
 * Server/prerender Supabase client.
 * Uses ANON key (safe for SSR/prerender if RLS allows read).
 * Falls back to VITE_* variants for local tooling.
 */
export function getSupabaseServerClient() {
  const SUPABASE_URL =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  const url = requireEnv("SUPABASE_URL (or VITE_SUPABASE_URL)", SUPABASE_URL);
  const key = requireEnv("SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)", SUPABASE_ANON_KEY);

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
