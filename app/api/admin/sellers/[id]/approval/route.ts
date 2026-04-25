import { NextResponse } from "next/server";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { resolveAdminEmail } from "@/lib/admin-config";
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

  const { id } = await ctx.params;
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) {
    return NextResponse.json({ error: "Yanlış satıcı id." }, { status: 400 });
  }

  let body: { status?: string; note?: string };
  try {
    body = (await req.json()) as { status?: string; note?: string };
  } catch {
    return NextResponse.json({ error: "JSON gözlənilir." }, { status: 400 });
  }

  const status = String(body.status ?? "").trim();
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Status yalnız approved və ya rejected ola bilər." }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;
  const reviewedBy = resolveAdminEmail() || "admin";

  const { data: seller, error: sellerErr } = await svc
    .from("sellers")
    .select("id, user_id, name")
    .eq("id", sid)
    .maybeSingle();

  if (sellerErr || !seller) {
    return NextResponse.json({ error: "Satıcı tapılmadı." }, { status: 404 });
  }

  const { error: updErr } = await svc
    .from("sellers")
    .update({
      approval_status: status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      review_note: note,
    })
    .eq("id", sid);

  if (updErr) {
    console.error("seller approval update failed", { sid, status, reason: updErr.message });
    return NextResponse.json({ error: "Status yenilənmədi." }, { status: 500 });
  }

  if (status === "rejected") {
    await svc.from("products").update({ is_published: false }).eq("seller_id", sid);
  }

  await svc
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("kind", "seller_application")
    .eq("seller_id", sid);

  if (seller.user_id) {
    await svc.from("seller_notifications").insert({
      user_id: seller.user_id,
      type: "system",
      title: status === "approved" ? "Satıcı profiliniz təsdiqləndi" : "Satıcı profiliniz rədd edildi",
      body:
        status === "approved"
          ? "Artıq satıcı paneliniz aktivdir və məhsul əlavə edə bilərsiniz."
          : "Müraciətiniz hazırda təsdiqlənmədi. Dəstək ilə əlaqə saxlayın.",
      href: "/dashboard",
    });
  }

  return NextResponse.json({ ok: true });
}
