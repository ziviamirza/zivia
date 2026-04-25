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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">İcmal</h1>
        <p className="mt-1 text-sm text-stone-400">
          Məlumat mənbəyi:{" "}
          <span className="font-mono text-[#d4b87a]">
            {mode === "service" ? "service role (tam)" : "anon (yalnız vitrinə düşən məhsullar)"}
          </span>
        </p>
      </div>

      {mode === "anon" ? (
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100/90">
          <strong className="text-amber-50">Tam nəzarət üçün:</strong> server mühitinə{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          əlavə edin (Supabase → Settings → API → service_role). O zaman gizli məhsullar və tam saylar
          görünəcək.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Məhsullar (cəmi)" value={productCount ?? "—"} />
        <StatCard label="Satıcılar" value={sellerCount ?? "—"} />
        <StatCard
          label="Yayımda deyil"
          value={hiddenProducts != null ? String(hiddenProducts) : "—"}
          hint={mode === "anon" ? "Service açarı ilə" : undefined}
        />
        <StatCard
          label="Auth istifadəçiləri"
          value={authUserTotal != null ? String(authUserTotal) : "—"}
          hint={mode === "anon" ? "Service açarı ilə" : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-stone-700 bg-stone-900/50 p-4 transition hover:border-[#a8843e]/50 hover:bg-stone-900"
        >
          <p className="text-sm font-semibold text-[#e8d5b0]">Məhsul siyahısı</p>
          <p className="mt-1 text-xs text-stone-500">Slug, qiymət, satıcı, yayım statusu</p>
        </Link>
        <Link
          href="/admin/sellers"
          className="rounded-xl border border-stone-700 bg-stone-900/50 p-4 transition hover:border-[#a8843e]/50 hover:bg-stone-900"
        >
          <p className="text-sm font-semibold text-[#e8d5b0]">Satıcılar</p>
          <p className="mt-1 text-xs text-stone-500">Vitrin keçidləri</p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-stone-700 bg-stone-900/50 p-4 transition hover:border-[#a8843e]/50 hover:bg-stone-900"
        >
          <p className="text-sm font-semibold text-[#e8d5b0]">İstifadəçilər</p>
          <p className="mt-1 text-xs text-stone-500">Supabase auth siyahısı və hesab silmə</p>
        </Link>
      </div>
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
    <div className="rounded-xl border border-stone-700 bg-stone-900/60 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-stone-500">{hint}</p> : null}
    </div>
  );
}
