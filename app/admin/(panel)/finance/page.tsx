import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";

export default async function AdminFinancePage() {
  const db = createAnonSupabaseServer();
  const { count: productCount } = await db.from("products").select("*", { head: true, count: "exact" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Maliyyə Paneli</h1>
        <select className="rounded-xl border border-[#e3ddd3] bg-white px-3 py-2 text-sm text-stone-700">
          <option>Metal Fəaliyyətlər</option>
          <option>Hamısı</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Cəmi Gəlir" value="$320,000" growth="+15%" />
        <Card title="Xalis Mənfəət" value="$48,000" growth="+10%" />
        <Card title="Vergi Ödənişləri" value="$12,500" />
        <Card title="Gözləyən Satıcı Ödənişləri" value="$85,000" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Gəlir Mənbələri və Xərclər</h2>
          <div className="grid h-44 grid-cols-12 items-end gap-2 rounded-xl border border-[#ece7de] bg-white p-3">
            {[38, 45, 56, 62, 54, 61, 58, 64, 52, 60, 66, 49].map((h, index) => (
              <div key={index} className="space-y-1">
                <div className="w-full rounded-md bg-[#ffd194]" style={{ height: `${h}px` }} />
                <div className="w-full rounded-md bg-[#ff7a00]/80" style={{ height: `${Math.max(18, h - 14)}px` }} />
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Müştəri LTV (Ömürboyu Dəyər)</h2>
          <div className="space-y-2 text-sm">
            <Row k="Emanat" v="$129.50" />
            <Row k="Sığorta" v="$99.90" />
            <Row k="Release timer" v="00:0013s" />
            <Row k="Müştəri LTV" v="$27.94" />
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-[#ff7a00] px-3 py-2 text-sm font-medium text-white hover:bg-[#ef7300]"
          >
            Kütləvi Ödəniş et
          </button>
        </aside>
      </div>

      <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Satıcı Ödənişləri (Payouts)</h2>
        <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-2">Vendor ID</th>
                <th className="px-3 py-2">Vendor Adı</th>
                <th className="px-3 py-2">Cəmi Satış</th>
                <th className="px-3 py-2">Komissiya</th>
                <th className="px-3 py-2">Ödəniləcək</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7de] text-stone-700">
              <tr>
                <td className="px-3 py-2">2020037</td>
                <td className="px-3 py-2">Zargar Eli</td>
                <td className="px-3 py-2">$320,000</td>
                <td className="px-3 py-2">$48,000</td>
                <td className="px-3 py-2">$85,000</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Gözləyir</span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">2020039</td>
                <td className="px-3 py-2">Diamond Eli</td>
                <td className="px-3 py-2">$90,000</td>
                <td className="px-3 py-2">$13,500</td>
                <td className="px-3 py-2">$22,500</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Tamamlandı</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-stone-500">Hazırda bazada görünən məhsul sayı: {productCount ?? 0}</p>
      </div>
    </div>
  );
}

function Card({ title, value, growth }: { title: string; value: string; growth?: string }) {
  return (
    <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] px-4 py-4">
      <p className="text-sm text-stone-600">{title}</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight text-stone-900">{value}</p>
      {growth ? <p className="mt-1 text-sm font-medium text-emerald-600">{growth}</p> : null}
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
