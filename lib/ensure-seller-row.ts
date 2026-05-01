import type { PostgrestError, SupabaseClient, User } from "@supabase/supabase-js";

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

/** Satıcı adı: brend → tam ad → e-poçtun @ əvvəli. */
export function sellerDisplayNameFromUser(user: User): string | null {
  const brand = String(user.user_metadata?.brand_name ?? "").trim();
  if (brand) return brand;
  const full = String(user.user_metadata?.full_name ?? "").trim();
  if (full) return full;
  const local = String(user.email ?? "").split("@")[0]?.trim();
  if (local) return local;
  return null;
}

function isMissingColumnError(err: PostgrestError | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  if (err.code === "42703") return true;
  if (msg.includes("column") && msg.includes("does not exist")) return true;
  return false;
}

export type DashboardSeller = {
  id: number;
  name: string;
  slug: string;
  user_id: string;
  whatsapp: string | null;
  description: string | null;
  avatar: string | null;
  approval_status: string;
  review_note: string | null;
};

type SellerRowRaw = Record<string, unknown>;

function normalizeDashboardSeller(row: SellerRowRaw | null): DashboardSeller | null {
  if (!row) return null;
  const hasApproval =
    Object.prototype.hasOwnProperty.call(row, "approval_status") &&
    row.approval_status != null &&
    String(row.approval_status).length > 0;
  const approval_status = hasApproval ? String(row.approval_status) : "approved";
  const review_note =
    "review_note" in row && row.review_note != null ? String(row.review_note) : null;

  return {
    id: Number(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    user_id: String(row.user_id ?? ""),
    whatsapp: row.whatsapp != null ? String(row.whatsapp) : null,
    description: row.description != null ? String(row.description) : null,
    avatar: row.avatar != null ? String(row.avatar) : null,
    approval_status,
    review_note,
  };
}

async function querySellerRow(
  supabase: SupabaseClient,
  userId: string,
  select: string,
) {
  return supabase
    .from("sellers")
    .select(select)
    .eq("user_id", userId)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
}

/**
 * Qeydiyyat metadata-sında və ya e-poçtdan göstəriləcək ad varsa və `sellers`
 * sətiri yoxdursa, RLS altında öz user_id üçün sətir yaradır.
 */
export async function ensureSellerRowForUser(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const brand = sellerDisplayNameFromUser(user);
  if (!brand) return;

  const slug = defaultSellerSlug(brand, user.id);
  const baseRow = {
    user_id: user.id,
    name: brand,
    slug,
    description: "Yeni satıcı profili",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    avatar: "",
  };

  let { error } = await supabase
    .from("sellers")
    .insert({ ...baseRow, approval_status: "pending" });

  if (error && isMissingColumnError(error)) {
    ({ error } = await supabase.from("sellers").insert(baseRow));
  }

  if (!error) return;
  if (error.code === "23505") return;
}

const SELLER_SELECT_FULL =
  "id, name, slug, user_id, whatsapp, description, avatar, approval_status, review_note";
const SELLER_SELECT_MINIMAL =
  "id, name, slug, user_id, whatsapp, description, avatar";

/** `.limit(1)` — eyni user üçün təsadüfi çox sətir olsa belə PGRST116 olmur. */
export async function fetchSellerForDashboard(supabase: SupabaseClient, user: User) {
  let { data: seller, error } = await querySellerRow(supabase, user.id, SELLER_SELECT_FULL);

  if (error && isMissingColumnError(error)) {
    const retry = await querySellerRow(supabase, user.id, SELLER_SELECT_MINIMAL);
    seller = retry.data as typeof seller;
    error = retry.error;
  }

  if (!seller && !error) {
    await ensureSellerRowForUser(supabase, user);
    let second = await querySellerRow(supabase, user.id, SELLER_SELECT_FULL);
    if (second.error && isMissingColumnError(second.error)) {
      second = await querySellerRow(supabase, user.id, SELLER_SELECT_MINIMAL);
    }
    seller = second.data;
    error = second.error;
  }

  const normalized = normalizeDashboardSeller(seller as SellerRowRaw | null);

  return { seller: normalized, error };
}
