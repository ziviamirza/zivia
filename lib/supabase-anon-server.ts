import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Serverdə istifadəçi sessiyası olmadan yalnız anon RLS ilə oxuma (admin vitrin statistikası). */
export function createAnonSupabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL və anon/publishable açar lazımdır.");
  }
  return createClient(url, key);
}
