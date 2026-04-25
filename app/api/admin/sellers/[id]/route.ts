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
    return NextResponse.json({ error: findErr.message }, { status: 500 });
  }
  if (!seller) {
    return NextResponse.json({ error: "Satıcı tapılmadı." }, { status: 404 });
  }

  const { error: pErr } = await svc.from("products").delete().eq("seller_id", sid);
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  const { error: sErr } = await svc.from("sellers").delete().eq("id", sid);
  if (sErr) {
    return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  if (seller.user_id) {
    const { error: authErr } = await svc.auth.admin.deleteUser(String(seller.user_id));
    if (authErr) {
      return NextResponse.json(
        { error: `Satıcı silindi, auth silinmədi: ${authErr.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
