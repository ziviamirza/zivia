import { NextResponse } from "next/server";
import { adminPurgeSellerCompletely } from "@/lib/admin-purge-seller";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { revalidateShopVitrin } from "@/lib/revalidate-shop";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Auth istifadəçisini və ona bağlı bütün satıcı məlumatlarını silir
 * (hər satıcı üçün tam təmizləmə; sonda bir dəfə auth.user).
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

  const { data: sellerRows, error: listErr } = await svc
    .from("sellers")
    .select("id")
    .eq("user_id", userId);

  if (listErr) {
    console.error("admin/users sellers lookup failed", { userId, reason: listErr.message });
    return NextResponse.json({ error: "İstifadəçi əlaqələri yoxlanarkən xəta baş verdi." }, { status: 500 });
  }

  for (const row of sellerRows ?? []) {
    const sid = Number(row.id);
    if (!Number.isFinite(sid)) continue;
    const result = await adminPurgeSellerCompletely(svc, sid, userId, { deleteAuthUser: false });
    if (!result.ok) {
      console.error("admin/users purge seller failed", { userId, sid, ...result });
      return NextResponse.json(
        {
          error: `Satıcı (${sid}) silinərkən xəta: ${result.step}`,
          detail: result.message,
        },
        { status: 500 },
      );
    }
  }

  const { error: authErr } = await svc.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error("admin/users auth delete failed", { userId, reason: authErr.message });
    return NextResponse.json({ error: "Auth istifadəçisi silinərkən xəta baş verdi." }, { status: 500 });
  }

  revalidateShopVitrin();

  return NextResponse.json({ ok: true });
}
