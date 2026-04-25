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

  const { data: recentProducts } = await db
    .from("products")
    .select("id, title, created_at, seller_id")
    .order("id", { ascending: false })
    .limit(6);

  const { data: recentSellers } = await db
    .from("sellers")
    .select("id, name, created_at")
    .order("id", { ascending: false })
    .limit(6);

  let hiddenProducts: number | null = null;
  let authUserTotal: number | null = null;
  let events30d: number | null = null;
  if (service) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [{ count }, authRes, eventRes] = await Promise.all([
      service.from("products").select("*", { count: "exact", head: true }).eq("is_published", false),
      service.auth.admin.listUsers({ page: 1, perPage: 1 }),
      service
        .from("seller_analytics_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since.toISOString()),
    ]);

    hiddenProducts = count;
    if (!authRes.error && authRes.data) authUserTotal = authRes.data.total;
    if (!eventRes.error) events30d = eventRes.count ?? 0;
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
        <StatCard label="Məhsullar (cəmi)" value={productCount ?? "—"} />
        <StatCard label="Satıcılar (cəmi)" value={sellerCount ?? "—"} />
        <StatCard label="Yayımlanmayan məhsul" value={hiddenProducts ?? "—"} hint={mode === "anon" ? "service tələb edir" : undefined} />
        <StatCard label="Auth istifadəçiləri" value={authUserTotal ?? "—"} hint={mode === "anon" ? "service tələb edir" : undefined} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 font-semibold text-stone-900">Son əlavə olunan məhsullar</h2>
          <ul className="space-y-2 text-sm text-stone-700">
            {(recentProducts ?? []).map((p) => (
              <li key={p.id} className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">
                <span className="font-medium">{p.title ?? "Adsız məhsul"}</span>{" "}
                <span className="text-xs text-stone-500">#{p.id}</span>
              </li>
            ))}
            {(recentProducts ?? []).length === 0 ? <li className="text-stone-500">Məlumat yoxdur.</li> : null}
          </ul>
        </section>
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 font-semibold text-stone-900">Son əlavə olunan satıcılar</h2>
          <ul className="space-y-2 text-sm text-stone-700">
            {(recentSellers ?? []).map((s) => (
              <li key={s.id} className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">
                <span className="font-medium">{s.name ?? "Adsız satıcı"}</span>{" "}
                <span className="text-xs text-stone-500">#{s.id}</span>
              </li>
            ))}
            {(recentSellers ?? []).length === 0 ? <li className="text-stone-500">Məlumat yoxdur.</li> : null}
          </ul>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
          href="/admin/analytics"
          className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 transition hover:border-[#ffb164]"
        >
          <p className="text-sm font-semibold text-stone-900">Analitika</p>
          <p className="mt-1 text-xs text-stone-500">Hadisə əsaslı real göstəricilər</p>
        </Link>
        <Link
          href="/admin/security"
          className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 transition hover:border-[#ffb164]"
        >
          <p className="text-sm font-semibold text-stone-900">Təhlükəsizlik</p>
          <p className="mt-1 text-xs text-stone-500">Audit və giriş nəzarəti</p>
        </Link>
      </div>

      {hiddenProducts != null || authUserTotal != null || events30d != null ? (
        <div className="rounded-xl border border-[#ece7de] bg-[#fcfcfb] p-4 text-sm text-stone-600">
          Gizli məhsullar: <strong>{hiddenProducts ?? "—"}</strong> · Auth istifadəçiləri:{" "}
          <strong>{authUserTotal ?? "—"}</strong> · 30 gün analitika eventləri: <strong>{events30d ?? "—"}</strong>
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
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}
