import Link from "next/link";
import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";

export default async function AdminOrdersPage() {
  const db = createAnonSupabaseServer();
  type OrderRow = {
    id: number | string;
    customer_name?: string | null;
    seller_id?: number | string | null;
    total_amount?: number | string | null;
    status?: string | null;
    created_at?: string | null;
  };
  type DynamicOrdersClient = {
    from: (
      table: string,
    ) => {
      select: (
        columns: string,
      ) => {
        order: (
          column: string,
          opts: { ascending: boolean },
        ) => { limit: (count: number) => Promise<{ data: OrderRow[] | null; error: { message: string } | null }> };
      };
    };
  };
  const ordersClient = db as unknown as DynamicOrdersClient;

  const { data, error } = await ordersClient
    .from("orders")
    .select("id, customer_name, seller_id, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Sifarişlər</h1>
          <p className="mt-1 text-xs text-stone-500">Real sifariş cədvəli məlumatları</p>
        </div>
        <Link href="/admin/users" className="text-xs font-medium text-[#ff7a00] underline">
          İstifadəçi qeydlərinə keç
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          `orders` cədvəli tapılmadı və ya struktur fərqlidir. Bu səhifə artıq saxta rəqəm göstərmir.
          <br />
          Texniki mesaj: {error.message}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Müştəri</th>
              <th className="px-3 py-2">Seller ID</th>
              <th className="px-3 py-2">Məbləğ</th>
              <th className="px-3 py-2">Tarix</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efebe3] text-stone-700">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-3 py-2">{row.id}</td>
                <td className="px-3 py-2">{row.customer_name ?? "—"}</td>
                <td className="px-3 py-2">{row.seller_id ?? "—"}</td>
                <td className="px-3 py-2">{fmtMoney(Number(row.total_amount) || 0)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-stone-500">
                  {row.created_at ? new Date(row.created_at).toLocaleString("az-AZ") : "—"}
                </td>
                <td className="px-3 py-2">{row.status ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-stone-500" colSpan={6}>
                  Sifariş qeydi tapılmadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
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
