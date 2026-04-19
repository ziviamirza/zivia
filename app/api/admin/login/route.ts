import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminAuthConfigured, signAdminJwt } from "@/lib/admin-token";
import { validateAdminCredentials } from "@/lib/admin-login-validate";

export const runtime = "nodejs";

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export async function POST(req: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin girişi serverdə konfiqurasiya edilməyib (ADMIN_EMAIL, ADMIN_CODE, ADMIN_JWT_SECRET)." },
      { status: 503 },
    );
  }

  let body: { email?: string; code?: string };
  try {
    body = (await req.json()) as { email?: string; code?: string };
  } catch {
    return NextResponse.json({ error: "JSON gözlənilir." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const code = typeof body.code === "string" ? body.code : "";

  if (!validateAdminCredentials(email, code)) {
    return NextResponse.json({ error: "E-poçt və ya kod yanlışdır." }, { status: 401 });
  }

  const token = await signAdminJwt();
  if (!token) {
    return NextResponse.json({ error: "JWT yaradıla bilmədi." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  /** path=/ bütün /admin sorğularına cookie göndərilməsini təmin edir (path=/admin bəzi hallarda çatışmaz). */
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
