import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-token";

export async function POST(request: Request) {
  const url = new URL("/admin/login", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
