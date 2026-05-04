import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

const EMAIL_OTP_TYPES = new Set<string>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");
  const nextPath = safeNextPath(url.searchParams.get("next"));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* ignore in edge cases */
          }
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", url.origin));
    }
    return NextResponse.redirect(new URL(nextPath, url.origin));
  }

  if (token_hash && typeRaw && EMAIL_OTP_TYPES.has(typeRaw)) {
    const { error } = await supabase.auth.verifyOtp({
      type: typeRaw as EmailOtpType,
      token_hash,
    });
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", url.origin));
    }
    return NextResponse.redirect(new URL(nextPath, url.origin));
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
