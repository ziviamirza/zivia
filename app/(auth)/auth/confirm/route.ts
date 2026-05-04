import { NextResponse } from "next/server";

/**
 * Supabase bəzi ssenarilərdə /auth/confirm keçidini gözləyir; yalnız /auth/callback
 * olduqda bu ünvana vuranda 404 olur. Sorğu parametrlərini saxlayaraq callback-ə yönləndiririk.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}
