import { NextResponse } from "next/server";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

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
  const pid = Number(id);
  if (!Number.isFinite(pid) || pid <= 0) {
    return NextResponse.json({ error: "Yanlış məhsul id." }, { status: 400 });
  }

  const { error } = await svc.from("products").delete().eq("id", pid);
  if (error) {
    console.error("admin/products delete failed", { pid, reason: error.message });
    return NextResponse.json({ error: "Məhsul silinərkən xəta baş verdi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
