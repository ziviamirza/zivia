import Link from "next/link";
import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

type Row = {
  id: number;
  title: string | null;
  slug: string | null;
  price: number | string | null;
  is_published?: boolean | null;
  stock_quantity?: number | null;
  seller_id?: number | null;
};

export default async function AdminProductsPage() {
  const service = createServiceSupabaseAdmin();
  const db = service ?? createAnonSupabaseServer();
  const mode = service ? "service" : "anon";

  const { data, error } = await db
    .from("products")
    .select("id, title, slug, price, is_published, stock_quantity, seller_id")
    .order("id", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Məhsullar</h1>
          <p className="mt-1 text-xs text-stone-400">
            Son 200 qeyd · oxuma:{" "}
            <span className="font-mono text-[#d4b87a]">{mode}</span>
          </p>
        </div>
        <Link href="/products" className="text-xs font-medium text-[#d4b87a] underline">
          Vitrinə bax
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-200">{error.message}</p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-stone-700">
        <table className="min-w-full divide-y divide-stone-700 text-left text-sm">
          <thead className="bg-stone-900/80 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Qiymət</th>
              {mode === "service" ? (
                <>
                  <th className="px-3 py-2">Yayım</th>
                  <th className="px-3 py-2">Stok</th>
                </>
              ) : null}
              <th className="px-3 py-2">Satıcı id</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 bg-stone-950/40">
            {rows.map((r) => (
              <tr key={r.id} className="text-stone-200">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="max-w-[200px] truncate px-3 py-2">{r.title ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                  {r.slug ? (
                    <Link href={`/products/${encodeURIComponent(r.slug)}`} className="text-[#d4b87a] underline">
                      {r.slug}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{r.price != null ? String(r.price) : "—"}</td>
                {mode === "service" ? (
                  <>
                    <td className="px-3 py-2">{r.is_published ? "bəli" : "xeyr"}</td>
                    <td className="px-3 py-2">{r.stock_quantity ?? "—"}</td>
                  </>
                ) : null}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.seller_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
