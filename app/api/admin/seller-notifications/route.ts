import { NextResponse } from "next/server";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

const NOTIF_TYPES = ["system", "promo"] as const;
type NotifType = (typeof NOTIF_TYPES)[number];

const CHUNK = 120;

export async function POST(req: Request) {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON gözlənilir." }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 200) {
    return NextResponse.json({ error: "Başlıq 1–200 simvol olmalıdır." }, { status: 400 });
  }

  const textBody =
    typeof body.body === "string" && body.body.trim().length > 0
      ? body.body.trim().slice(0, 4000)
      : null;
  const href =
    typeof body.href === "string" && body.href.trim().length > 0
      ? body.href.trim().slice(0, 500)
      : null;

  const typeRaw = typeof body.type === "string" ? body.type.trim() : "promo";
  const type: NotifType = NOTIF_TYPES.includes(typeRaw as NotifType) ? (typeRaw as NotifType) : "promo";

  const scope = typeof body.scope === "string" ? body.scope.trim() : "";
  if (scope !== "all" && scope !== "seller") {
    return NextResponse.json({ error: "scope yalnız all və ya seller ola bilər." }, { status: 400 });
  }

  let userIds: string[] = [];

  if (scope === "seller") {
    const sellerId = Number(body.sellerId);
    if (!Number.isFinite(sellerId) || sellerId <= 0) {
      return NextResponse.json({ error: "sellerId lazımdır." }, { status: 400 });
    }
    const { data: seller, error } = await svc
      .from("sellers")
      .select("user_id")
      .eq("id", sellerId)
      .maybeSingle();
    if (error || !seller?.user_id) {
      return NextResponse.json({ error: "Satıcı tapılmadı və ya hesab bağlı deyil." }, { status: 404 });
    }
    userIds = [seller.user_id as string];
  } else {
    const { data: rows, error } = await svc.from("sellers").select("user_id").not("user_id", "is", null);
    if (error) {
      console.error("seller-notifications broadcast list failed", error.message);
      return NextResponse.json({ error: "Satıcı siyahısı alınmadı." }, { status: 500 });
    }
    const set = new Set<string>();
    for (const r of rows ?? []) {
      const uid = (r as { user_id?: string | null }).user_id;
      if (uid) set.add(uid);
    }
    userIds = [...set];
    if (userIds.length === 0) {
      return NextResponse.json({ error: "Bağlı hesabı olan satıcı yoxdur." }, { status: 400 });
    }
  }

  const payloads = userIds.map((user_id) => ({
    user_id,
    type,
    title,
    body: textBody,
    href,
  }));

  let inserted = 0;
  for (let i = 0; i < payloads.length; i += CHUNK) {
    const slice = payloads.slice(i, i + CHUNK);
    const { error } = await svc.from("seller_notifications").insert(slice);
    if (error) {
      console.error("seller_notifications insert chunk failed", error.message);
      return NextResponse.json({ error: "Bildiriş yazılmadı.", detail: error.message }, { status: 500 });
    }
    inserted += slice.length;
  }

  return NextResponse.json({ ok: true, sent: inserted });
}
