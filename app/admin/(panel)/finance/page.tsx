import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";

export default async function AdminFinancePage() {
  const db = createAnonSupabaseServer();
  const { data: products } = await db
    .from("products")
    .select("id, title, price, seller_id, is_published")
    .order("id", { ascending: false })
    .limit(500);
  const { data: sellers } = await db.from("sellers").select("id, name").limit(500);

  const productCount = products?.length ?? 0;
  const publishedCount = (products ?? []).filter((p) => p.is_published !== false).length;
  const sellerCount = sellers?.length ?? 0;
  const totalCatalogValue = (products ?? []).reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const averagePrice = productCount > 0 ? totalCatalogValue / productCount : 0;

  const bySeller = new Map<number, { count: number; total: number }>();
  for (const p of products ?? []) {
    const sid = Number(p.seller_id ?? 0);
    if (!sid) continue;
    const prev = bySeller.get(sid) ?? { count: 0, total: 0 };
    prev.count += 1;
    prev.total += Number(p.price) || 0;
    bySeller.set(sid, prev);
  }

  const sellerName = new Map<number, string>();
  for (const s of sellers ?? []) {
    sellerName.set(Number(s.id), s.name ?? `Seller #${s.id}`);
  }

  const topSellerRows = [...bySeller.entries()]
    .map(([sid, row]) => ({
      sid,
      name: sellerName.get(sid) ?? `Seller #${sid}`,
      count: row.count,
      total: row.total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Maliyyə Paneli</h1>
        <span className="rounded-xl border border-[#e3ddd3] bg-white px-3 py-2 text-xs text-stone-600">Real data</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Kataloq dəyəri cəmi" value={fmtMoney(totalCatalogValue)} />
        <Card title="Orta məhsul qiyməti" value={fmtMoney(averagePrice)} />
        <Card title="Yayımlanan məhsul sayı" value={String(publishedCount)} />
        <Card title="Satıcı sayı" value={String(sellerCount)} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Ən yüksək kataloq dəyərinə görə satıcılar</h2>
          <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-3 py-2">Satıcı</th>
                  <th className="px-3 py-2">Məhsul sayı</th>
                  <th className="px-3 py-2">Qiymət cəmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece7de] text-stone-700">
                {topSellerRows.map((r) => (
                  <tr key={r.sid}>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.count}</td>
                    <td className="px-3 py-2">{fmtMoney(r.total)}</td>
                  </tr>
                ))}
                {topSellerRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-3 text-stone-500">
                      Məlumat yoxdur.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Qısa maliyyə icmalı</h2>
          <div className="space-y-2 text-sm">
            <Row k="Məhsul sayı" v={String(productCount)} />
            <Row k="Yayımlanmayanlar" v={String(Math.max(0, productCount - publishedCount))} />
            <Row k="Qiymətsiz məhsullar" v={String((products ?? []).filter((p) => !Number(p.price)).length)} />
            <Row k="Satıcı başına orta məhsul" v={sellerCount ? (productCount / sellerCount).toFixed(1) : "0"} />
          </div>
        </aside>
      </div>

      <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Son əlavə olunan məhsullar</h2>
        <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Məhsul</th>
                <th className="px-3 py-2">Qiymət</th>
                <th className="px-3 py-2">Seller ID</th>
                <th className="px-3 py-2">Yayım</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7de] text-stone-700">
              {(products ?? []).slice(0, 12).map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2">{p.title ?? "—"}</td>
                  <td className="px-3 py-2">{fmtMoney(Number(p.price) || 0)}</td>
                  <td className="px-3 py-2">{p.seller_id ?? "—"}</td>
                  <td className="px-3 py-2">{p.is_published === false ? "xeyr" : "bəli"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Qeyd: Bu bölmə saxta payout rəqəmləri göstərmir; yalnız real məhsul və qiymət məlumatlarını göstərir.
        </p>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] px-4 py-4">
      <p className="text-sm text-stone-600">{title}</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight text-stone-900">{value}</p>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#ece7de] bg-white px-3 py-2">
      <span className="text-stone-600">{k}</span>
      <span className="font-medium text-stone-900">{v}</span>
    </div>
  );
}

function fmtMoney(value: number) {
  return new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency: "AZN",
    maximumFractionDigits: 0,
  }).format(value);
}
