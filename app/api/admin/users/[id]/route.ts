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
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  for (const row of sellers ?? []) {
    const sid = row.id as number;
    await svc.from("products").delete().eq("seller_id", sid);
    await svc.from("sellers").delete().eq("id", sid);
  }

  const { error: authErr } = await svc.auth.admin.deleteUser(userId);
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
