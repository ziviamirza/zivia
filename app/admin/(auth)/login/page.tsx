import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/admin-config";
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
          Bu <strong>Satıcı paneli deyil</strong> — Supabase qeydiyyatı və ya e-poçt təsdiqi lazım deyil.
          Yalnız admin e-poçtu və xüsusi kod ilə{" "}
          <span className="whitespace-nowrap text-[#8b6b2c]">/admin</span> idarəetməsinə daxil olursunuz.
        </p>
        <p className="mt-2 rounded-lg bg-stone-100/80 px-2.5 py-1.5 text-[11px] text-stone-600">
          Standart e-poçt: <code className="font-mono text-stone-800">{DEFAULT_ADMIN_EMAIL}</code> — şifrə
          yox, <strong>xüsusi kod</strong> sahəsinə admin kodunuzu yazın.
        </p>
        <AdminLoginForm nextPath={nextPath} defaultEmail={DEFAULT_ADMIN_EMAIL} />
      </div>
    </div>
  );
}
