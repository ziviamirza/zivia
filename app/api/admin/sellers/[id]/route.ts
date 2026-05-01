import { NextResponse } from "next/server";
import { adminPurgeSellerCompletely } from "@/lib/admin-purge-seller";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { revalidateShopVitrin } from "@/lib/revalidate-shop";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Satıcı və ona aid hər şeyi silir: admin bildirişləri, məhsul şəkilləri (storage),
 * məhsullar, satıcı sətiri, auth istifadəçisi (seller_notifications CASCADE).
 */
export async function DELETE(_req: Request, ctx: Ctx) {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) {
    return NextResponse.json({ error: "Yanlış satıcı id." }, { status: 400 });
  }

  const { data: seller, error: findErr } = await svc
    .from("sellers")
    .select("id, user_id")
    .eq("id", sid)
    .maybeSingle();

  if (findErr) {
    console.error("admin/sellers read failed", { sid, reason: findErr.message });
    return NextResponse.json({ error: "Satıcı yoxlanarkən xəta baş verdi." }, { status: 500 });
  }
  if (!seller) {
    return NextResponse.json({ error: "Satıcı tapılmadı." }, { status: 404 });
  }

  const userId = seller.user_id != null ? String(seller.user_id) : null;
  const result = await adminPurgeSellerCompletely(svc, sid, userId);

  if (!result.ok) {
    console.error("admin/sellers purge failed", { sid, ...result });
    const labels: Record<string, string> = {
      admin_notifications: "Admin bildirişləri silinərkən xəta.",
      storage: "Məhsul şəkilləri silinərkən xəta.",
      seller_analytics_events: "Analitika qeydləri silinərkən xəta.",
      products: "Məhsullar silinərkən xəta.",
      sellers: "Satıcı silinərkən xəta.",
      auth: "Auth hesabı silinərkən xəta.",
    };
    return NextResponse.json(
      {
        error: labels[result.step] ?? "Silinmə zamanı xəta baş verdi.",
        detail: result.message,
      },
      { status: 500 },
    );
  }

  revalidateShopVitrin();

  return NextResponse.json({ ok: true });
}
