import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export default async function AdminAnalyticsPage() {
  const service = createServiceSupabaseAdmin();
  const db = service ?? createAnonSupabaseServer();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: events, error } = await db
    .from("seller_analytics_events")
    .select("event_type, seller_id, product_id, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(150);

  const rows = events ?? [];
  const productViews = rows.filter((r) => r.event_type === "product_view").length;
  const waClicks = rows.filter((r) => r.event_type === "whatsapp_click").length;
  const profileViews = rows.filter((r) => r.event_type === "seller_profile_view").length;
  const uniqueSellers = new Set(rows.map((r) => r.seller_id).filter((v) => v != null)).size;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Analitika</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Məhsul baxışı (30 gün)" value={String(productViews)} />
        <Card title="WhatsApp klikləri (30 gün)" value={String(waClicks)} />
        <Card title="Profil baxışları (30 gün)" value={String(profileViews)} />
        <Card title="Aktiv satıcı sayı (event)" value={String(uniqueSellers)} />
      </div>

      <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 font-semibold text-stone-900">Son analitika hadisələri</h2>
        {error ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Analitika cədvəli əlçatan deyil: {error.message}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">Seller ID</th>
                  <th className="px-3 py-2">Product ID</th>
                  <th className="px-3 py-2">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efebe3] text-stone-700">
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={`${r.created_at ?? "t"}-${i}`}>
                    <td className="px-3 py-2">{r.event_type ?? "—"}</td>
                    <td className="px-3 py-2">{r.seller_id ?? "—"}</td>
                    <td className="px-3 py-2">{r.product_id ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-stone-500">
                      {r.created_at ? new Date(r.created_at).toLocaleString("az-AZ") : "—"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-stone-500" colSpan={4}>
                      Son 30 gün üçün event tapılmadı.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] px-4 py-4">
      <p className="text-sm text-stone-600">{title}</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight text-stone-900">{value}</p>
    </div>
  );
}
