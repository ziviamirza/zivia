import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Yalnız serverdə, admin JWT yoxlandıqdan sonra.
 * `.env`-də SUPABASE_SERVICE_ROLE_KEY varsa tam vitrin (gizli məhsullar daxil).
 */
export function createServiceSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
