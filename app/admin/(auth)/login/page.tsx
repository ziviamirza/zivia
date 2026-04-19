import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminJwt } from "@/lib/admin-token";
import AdminLoginForm from "./AdminLoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nextPath = sp.next?.startsWith("/admin") && sp.next !== "/admin/login" ? sp.next : "/admin";

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (token && (await verifyAdminJwt(token))) {
    redirect(nextPath);
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[var(--zivia-cream)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#e6dbc7] bg-[var(--zivia-warm-white)] p-6 shadow-[0_10px_30px_-22px_rgba(77,55,20,0.42)]">
        <h1 className="font-display text-2xl text-[#2f2517]">Admin girişi</h1>
        <p className="mt-1 text-xs text-stone-500">
          Yalnız sizə verilmiş e-poçt və xüsusi kod ilə daxil olun.
        </p>
        <AdminLoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
