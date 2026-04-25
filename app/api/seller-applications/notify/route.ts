import { NextResponse } from "next/server";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";
import { sendNewSellerApplicationEmail } from "@/lib/admin-application-email";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Body = {
  userId?: string;
  email?: string;
  brandName?: string;
};

export async function POST(req: Request) {
  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ ok: true });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON gözlənilir." }, { status: 400 });
  }

  const userId = String(body.userId ?? "").trim();
  const email = String(body.email ?? "").trim();
  const brandName = String(body.brandName ?? "").trim();

  if (!UUID_RE.test(userId) || !email || !brandName) {
    return NextResponse.json({ error: "Məlumat natamamdır." }, { status: 400 });
  }

  const authRes = await svc.auth.admin.getUserById(userId);
  const authUser = authRes.data.user;
  if (authRes.error || !authUser) {
    return NextResponse.json({ ok: true });
  }

  if (String(authUser.email ?? "").toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ ok: true });
  }

  const { data: seller, error: sellerErr } = await svc
    .from("sellers")
    .select("id, name, approval_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (sellerErr || !seller) {
    return NextResponse.json({ ok: true });
  }

  await svc.from("admin_notifications").upsert(
    {
      kind: "seller_application",
      title: "Yeni satıcı müraciəti",
      body: `${seller.name ?? brandName} yoxlanış gözləyir.`,
      href: "/admin/sellers",
      seller_id: seller.id,
      is_read: false,
    },
    { onConflict: "kind,seller_id" },
  );

  try {
    await sendNewSellerApplicationEmail({
      sellerName: String(seller.name ?? brandName),
      sellerEmail: email,
      sellerId: seller.id,
    });
  } catch (err) {
    console.error("seller application email failed", err);
  }

  return NextResponse.json({ ok: true });
}
