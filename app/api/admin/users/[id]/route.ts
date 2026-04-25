import { NextResponse } from "next/server";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Auth istifadəçisini və ona bağlı satıcı/məhsulları silir (əvvəlcə məhsul və satıcı sətirləri).
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

  const { id: userId } = await ctx.params;
  if (!userId || !UUID_RE.test(userId)) {
    return NextResponse.json({ error: "Yanlış istifadəçi id (UUID)." }, { status: 400 });
  }

  const { data: sellers, error: listErr } = await svc
    .from("sellers")
    .select("id")
    .eq("user_id", userId);

  if (listErr) {
    console.error("admin/users sellers lookup failed", { userId, reason: listErr.message });
    return NextResponse.json({ error: "İstifadəçi əlaqələri yoxlanarkən xəta baş verdi." }, { status: 500 });
  }

  for (const row of sellers ?? []) {
    const sid = row.id as number;
    const { error: pErr } = await svc.from("products").delete().eq("seller_id", sid);
    if (pErr) {
      console.error("admin/users product cleanup failed", { userId, sid, reason: pErr.message });
      return NextResponse.json({ error: "İstifadəçi məhsulları silinərkən xəta baş verdi." }, { status: 500 });
    }
    const { error: sErr } = await svc.from("sellers").delete().eq("id", sid);
    if (sErr) {
      console.error("admin/users seller cleanup failed", { userId, sid, reason: sErr.message });
      return NextResponse.json({ error: "İstifadəçi satıcısı silinərkən xəta baş verdi." }, { status: 500 });
    }
  }

  const { error: authErr } = await svc.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error("admin/users auth delete failed", { userId, reason: authErr.message });
    return NextResponse.json({ error: "Auth istifadəçisi silinərkən xəta baş verdi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
