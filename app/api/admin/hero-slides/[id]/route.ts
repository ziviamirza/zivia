import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { normalizeAlt, normalizeLinkUrl, isAllowedHeroImageUrl } from "@/lib/admin-hero-validate";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." }, { status: 503 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Yanlış id." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON gözlənilir." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if ("sort_order" in body) {
    const sort_order = Number(body.sort_order);
    if (!Number.isFinite(sort_order) || sort_order < 1 || sort_order > 100) {
      return NextResponse.json({ error: "sort_order 1–100 arası olmalıdır." }, { status: 400 });
    }
    patch.sort_order = sort_order;
  }

  if ("image_url" in body) {
    const image_url = typeof body.image_url === "string" ? body.image_url.trim() : "";
    if (!isAllowedHeroImageUrl(image_url)) {
      return NextResponse.json(
        { error: "Şəkil URL yalnız https, Unsplash və ya hero-images storage ola bilər." },
        { status: 400 },
      );
    }
    patch.image_url = image_url;
  }

  if ("alt_text" in body) {
    patch.alt_text = normalizeAlt(typeof body.alt_text === "string" ? body.alt_text : undefined);
  }

  if ("link_url" in body) {
    patch.link_url = normalizeLinkUrl(
      body.link_url === null || body.link_url === ""
        ? null
        : typeof body.link_url === "string"
          ? body.link_url
          : null,
    );
  }

  if ("is_active" in body) {
    patch.is_active = Boolean(body.is_active);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Yenilənəcək sahə yoxdur." }, { status: 400 });
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await svc
    .from("home_hero_slides")
    .update(patch)
    .eq("id", id)
    .select("id, sort_order, image_url, alt_text, link_url, is_active, created_at, updated_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Yenilənmədi.", detail: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Slayd tapılmadı." }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ slide: data });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." }, { status: 503 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Yanlış id." }, { status: 400 });
  }

  const { error } = await svc.from("home_hero_slides").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Silinmədi.", detail: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
