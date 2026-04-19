import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminJwt } from "@/lib/admin-token";

export async function requireAdminOrRedirect(loginNext?: string): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const ok = await verifyAdminJwt(token);
  if (!ok) {
    const q = loginNext ? `?next=${encodeURIComponent(loginNext)}` : "";
    redirect(`/admin/login${q}`);
  }
}
