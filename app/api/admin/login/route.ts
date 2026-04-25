import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminAuthConfigured, signAdminJwt } from "@/lib/admin-token";
import { missingAdminEnvKeys } from "@/lib/admin-config";
import {
  clearLoginFailures,
  getClientIp,
  getLoginRateLimitState,
  noteLoginFailure,
} from "@/lib/admin-login-rate-limit";
import { validateAdminCredentials } from "@/lib/admin-login-validate";

export const runtime = "nodejs";

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export async function POST(req: Request) {
  const missingEnv = missingAdminEnvKeys();
  if (!adminAuthConfigured() || missingEnv.length > 0) {
    return NextResponse.json(
      { error: `Admin konfiqurasiyası natamamdır: ${missingEnv.join(", ") || "ADMIN_JWT_SECRET"}.` },
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
  const clientIp = getClientIp(req);

  const limitState = getLoginRateLimitState(clientIp, email);
  if (limitState.blocked) {
    return NextResponse.json(
      { error: "Çox sayda uğursuz cəhd oldu. Bir qədər sonra yenidən yoxlayın." },
      { status: 429, headers: { "Retry-After": String(limitState.retryAfterSec) } },
    );
  }

  if (!validateAdminCredentials(email, code)) {
    noteLoginFailure(clientIp, email);
    return NextResponse.json({ error: "E-poçt və ya kod yanlışdır." }, { status: 401 });
  }
  clearLoginFailures(clientIp, email);

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
