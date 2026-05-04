import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { normalizeAlt, normalizeLinkUrl, isAllowedHeroImageUrl } from "@/lib/admin-hero-validate";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

const MAX_SLIDES = 15;

export async function GET() {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." }, { status: 503 });
  }

  const { data, error } = await svc
    .from("home_hero_slides")
    .select("id, sort_order, image_url, alt_text, link_url, is_active, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Oxunmadı.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ slides: data ?? [] });
}

export async function POST(req: Request) {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." }, { status: 503 });
  }

  const { count, error: countErr } = await svc
    .from("home_hero_slides")
    .select("*", { count: "exact", head: true });
  if (countErr) {
    return NextResponse.json({ error: "Sayılma alınmadı." }, { status: 500 });
  }
  if ((count ?? 0) >= MAX_SLIDES) {
    return NextResponse.json({ error: `Ən çox ${MAX_SLIDES} slayd ola bilər.` }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON gözlənilir." }, { status: 400 });
  }

  const sort_order = Number(body.sort_order);
  if (!Number.isFinite(sort_order) || sort_order < 1 || sort_order > 100) {
    return NextResponse.json({ error: "sort_order 1–100 arası olmalıdır." }, { status: 400 });
  }

  const image_url = typeof body.image_url === "string" ? body.image_url.trim() : "";
  if (!isAllowedHeroImageUrl(image_url)) {
    return NextResponse.json(
      { error: "Şəkil URL yalnız https, Unsplash və ya hero-images storage ola bilər." },
      { status: 400 },
    );
  }

  const alt_text = normalizeAlt(typeof body.alt_text === "string" ? body.alt_text : undefined);
  const link_url = normalizeLinkUrl(typeof body.link_url === "string" ? body.link_url : null);
  const is_active = body.is_active === false ? false : true;

  const { data, error } = await svc
    .from("home_hero_slides")
    .insert({
      sort_order,
      image_url,
      alt_text,
      link_url,
      is_active,
    })
    .select("id, sort_order, image_url, alt_text, link_url, is_active, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Əlavə olunmadı.", detail: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ slide: data });
}
