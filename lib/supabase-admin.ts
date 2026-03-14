import { createClient } from "@supabase/supabase-js";

// Admin client bypasses RLS — use only in API routes for trusted operations.
// Falls back to anon key if service role key is not set (dev environments).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  const key = serviceKey || anonKey;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (!serviceKey) {
    console.warn("[supabase-admin] SUPABASE_SERVICE_ROLE_KEY not set, falling back to anon key. RLS will apply.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
