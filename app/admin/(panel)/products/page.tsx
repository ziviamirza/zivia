import Link from "next/link";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
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
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Kataloq</h1>
          <p className="mt-1 text-xs text-stone-500">
            Son 200 qeyd · oxuma:{" "}
            <span className="font-mono text-stone-700">{mode}</span>
          </p>
        </div>
        <Link href="/products" className="text-xs font-medium text-[#ff7a00] underline">
          Vitrinə bax
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
      ) : null}

      {mode === "service" ? (
        <p className="text-[11px] text-stone-500">
          Silmə üçün serverdə <code className="rounded bg-stone-100 px-1 font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          olmalıdır.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
        <table className="min-w-full divide-y divide-[#ece7de] text-left text-sm">
          <thead className="bg-[#f8f8f6] text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Qiymət</th>
              {mode === "service" ? (
                <>
                  <th className="px-3 py-2">Yayım</th>
                  <th className="px-3 py-2">Stok</th>
                  <th className="px-3 py-2">Əməliyyat</th>
                </>
              ) : null}
              <th className="px-3 py-2">Satıcı id</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efebe3] bg-white">
            {rows.map((r) => (
              <tr key={r.id} className="text-stone-700">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="max-w-[200px] truncate px-3 py-2">{r.title ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                  {r.slug ? (
                    <Link href={`/products/${encodeURIComponent(r.slug)}`} className="text-[#ff7a00] underline">
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
                    <td className="px-3 py-2">
                      <AdminDeleteButton
                        actionLabel="Sil"
                        confirmText={`Məhsulu (#${r.id}) verilənlər bazasından silmək? Əməliyyat geri alınmaz.`}
                        endpoint={`/api/admin/products/${encodeURIComponent(String(r.id))}`}
                      />
                    </td>
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
