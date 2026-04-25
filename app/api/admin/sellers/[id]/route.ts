import { NextResponse } from "next/server";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Satıcı sətrini, onun məhsullarını və əlaqəli auth istifadəçisini silir.
 * Geri qaytarılmır — təsdiq UI-də verilir.
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

  const { error: pErr } = await svc.from("products").delete().eq("seller_id", sid);
  if (pErr) {
    console.error("admin/sellers product delete failed", { sid, reason: pErr.message });
    return NextResponse.json({ error: "Satıcı məhsulları silinərkən xəta baş verdi." }, { status: 500 });
  }

  const { error: sErr } = await svc.from("sellers").delete().eq("id", sid);
  if (sErr) {
    console.error("admin/sellers row delete failed", { sid, reason: sErr.message });
    return NextResponse.json({ error: "Satıcı silinərkən xəta baş verdi." }, { status: 500 });
  }

  if (seller.user_id) {
    const { error: authErr } = await svc.auth.admin.deleteUser(String(seller.user_id));
    if (authErr) {
      console.error("admin/sellers auth delete failed", {
        sid,
        userId: String(seller.user_id),
        reason: authErr.message,
      });
      return NextResponse.json(
        { error: "Satıcı silindi, amma auth hesabı silinmədi." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
