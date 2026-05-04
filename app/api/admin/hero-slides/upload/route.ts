import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminApiOr401 } from "@/lib/admin-route-guard";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function POST(req: Request) {
  const deny = await requireAdminApiOr401();
  if (deny) return deny;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY lazımdır." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData gözlənilir." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size < 1) {
    return NextResponse.json({ error: "file sahəsi lazımdır." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fayl 6 MB-dan böyük ola bilməz." }, { status: 400 });
  }

  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "Yalnız JPEG, PNG, WebP və ya GIF." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `banner/${randomUUID()}.${extFromMime(mime)}`;

  const { error: upErr } = await svc.storage.from("hero-images").upload(name, buf, {
    contentType: mime,
    upsert: false,
  });

  if (upErr) {
    return NextResponse.json({ error: "Yükləmə alınmadı.", detail: upErr.message }, { status: 500 });
  }

  const { data: pub } = svc.storage.from("hero-images").getPublicUrl(name);
  const url = pub?.publicUrl;
  if (!url) {
    return NextResponse.json({ error: "Public URL alınmadı." }, { status: 500 });
  }

  return NextResponse.json({ url });
}
