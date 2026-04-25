import Link from "next/link";
import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export default async function AdminHomePage() {
  const service = createServiceSupabaseAdmin();
  const db = service ?? createAnonSupabaseServer();
  const mode = service ? "service" : "anon";

  const [{ count: productCount }, { count: sellerCount }] = await Promise.all([
    db.from("products").select("*", { count: "exact", head: true }),
    db.from("sellers").select("*", { count: "exact", head: true }),
  ]);

  let hiddenProducts: number | null = null;
  let authUserTotal: number | null = null;
  if (service) {
    const { count } = await service
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_published", false);
    hiddenProducts = count;

    const { data: authPage, error: authListErr } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    if (!authListErr && authPage) {
      authUserTotal = authPage.total;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Canlı Statistika</h1>
        <p className="rounded-lg border border-[#eee6d8] bg-[#f8f2e7] px-3 py-1.5 text-xs text-stone-600">
          Məlumat rejimi: <span className="font-mono">{mode}</span>
        </p>
      </div>

      {mode === "anon" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tam nəzarət üçün <code>SUPABASE_SERVICE_ROLE_KEY</code> əlavə edin.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ümumi Satış (GMV)" value="$248,500" hint="+12.5%" />
        <StatCard label="Xalis Gəlir (Komissiya)" value="$37,275" hint="+8.1%" />
        <StatCard label="Məhsullar (cəmi)" value={productCount ?? "—"} hint="Sistem məlumatı" />
        <StatCard
          label="Satıcılar"
          value={sellerCount ?? "—"}
          hint={mode === "anon" ? "Service açarı ilə" : undefined}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Qızılın Canlı Qiyməti (XAU/AZN)</h2>
            <span className="rounded-lg border border-[#e5dfd5] bg-white px-2.5 py-1 text-xs">Metal Qiyməti</span>
          </div>
          <div className="relative h-44 rounded-xl border border-[#ece7de] bg-white">
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#fff_5%,#f6f4ef_100%)]" />
            <svg viewBox="0 0 600 180" className="absolute inset-0 h-full w-full p-3 text-stone-800">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                points="20,150 120,125 220,120 300,80 380,105 470,58 560,30"
              />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 font-semibold text-stone-900">Son Fəaliyyətlər</h2>
          <ul className="space-y-3 text-sm text-stone-700">
            <li className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">Yeni satıcı müraciəti daxil olub.</li>
            <li className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">Məhsul qiyməti yeniləndi.</li>
            <li className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">Komissiya dərəcəsi dəyişdirildi.</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/products"
          className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 transition hover:border-[#ffb164]"
        >
          <p className="text-sm font-semibold text-stone-900">Kataloq</p>
          <p className="mt-1 text-xs text-stone-500">Məhsul idarəetməsi</p>
        </Link>
        <Link
          href="/admin/sellers"
          className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 transition hover:border-[#ffb164]"
        >
          <p className="text-sm font-semibold text-stone-900">Satıcılar</p>
          <p className="mt-1 text-xs text-stone-500">Satıcı idarəetməsi</p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 transition hover:border-[#ffb164]"
        >
          <p className="text-sm font-semibold text-stone-900">Sifariş / istifadəçi</p>
          <p className="mt-1 text-xs text-stone-500">Auth və sifariş qeydləri</p>
        </Link>
        <Link
          href="/admin/security"
          className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 transition hover:border-[#ffb164]"
        >
          <p className="text-sm font-semibold text-stone-900">Təhlükəsizlik</p>
          <p className="mt-1 text-xs text-stone-500">Audit və giriş nəzarəti</p>
        </Link>
      </div>

      {hiddenProducts != null || authUserTotal != null ? (
        <div className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 text-sm text-stone-600">
          Gizli məhsullar: <strong>{hiddenProducts ?? "—"}</strong> · Auth istifadəçiləri:{" "}
          <strong>{authUserTotal ?? "—"}</strong>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-emerald-600">{hint}</p> : null}
    </div>
  );
}
