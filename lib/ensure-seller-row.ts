import type { SupabaseClient, User } from "@supabase/supabase-js";

/** DB `slugify_az` ilə uyğun (satıcı slug üçün). */
export function slugifyAz(input: string): string {
  let s = String(input ?? "")
    .trim()
    .toLowerCase();
  s = s.replace(/ə/g, "e");
  s = s.replace(/ü/g, "u");
  s = s.replace(/ö/g, "o");
  s = s.replace(/ğ/g, "g");
  s = s.replace(/ş/g, "s");
  s = s.replace(/ç/g, "c");
  s = s.replace(/ı/g, "i");
  s = s.replace(/\s+/g, "-");
  s = s.replace(/[^a-z0-9-]/g, "");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  if (!s) s = "satici";
  return s;
}

export function defaultSellerSlug(brand: string, userId: string): string {
  const base = slugifyAz(brand);
  const idPart = userId.replace(/-/g, "").slice(0, 12);
  return `${base}-${idPart}`;
}

/**
 * Qeydiyyat metadata-sında `brand_name` varsa və `sellers` sətiri yoxdursa,
 * RLS altında öz user_id üçün bir sətir yaradır (e-poçt təsdiqindən sonra
 * köhnə trigger qaçıbsa və ya sıra yaradılmayıbsa).
 */
export async function ensureSellerRowForUser(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const brand = String(user.user_metadata?.brand_name ?? "").trim();
  if (!brand) return;

  const slug = defaultSellerSlug(brand, user.id);
  const { error } = await supabase.from("sellers").insert({
    user_id: user.id,
    name: brand,
    slug,
    description: "Yeni satıcı profili",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    avatar: "",
    approval_status: "pending",
  });

  if (!error) return;
  // Slug və ya sətir artıq var — yenidən oxuma kifayətdir
  if (error.code === "23505") return;
}

const DASHBOARD_SELLER_SELECT =
  "id, name, slug, user_id, whatsapp, description, avatar, approval_status, review_note";

/** `.limit(1)` — eyni user üçün təsadüfi çox sətir olsa belə PGRST116 olmur. */
export async function fetchSellerForDashboard(supabase: SupabaseClient, user: User) {
  let { data: seller, error } = await supabase
    .from("sellers")
    .select(DASHBOARD_SELLER_SELECT)
    .eq("user_id", user.id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!seller && !error) {
    await ensureSellerRowForUser(supabase, user);
    const second = await supabase
      .from("sellers")
      .select(DASHBOARD_SELLER_SELECT)
      .eq("user_id", user.id)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    seller = second.data;
    error = second.error;
  }

  return { seller, error };
}
