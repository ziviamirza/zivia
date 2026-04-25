import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminJwt } from "@/lib/admin-token";

/** API route handler-lərində: admin JWT cookie yoxlaması. */
export async function requireAdminApiOr401(): Promise<NextResponse | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminJwt(token))) {
    return NextResponse.json({ error: "Admin icazəsi yoxdur." }, { status: 401 });
  }
  return null;
}
