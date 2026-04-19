import Link from "next/link";
import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";

type Row = {
  id: number;
  name: string | null;
  slug: string | null;
  user_id?: string | null;
};

export default async function AdminSellersPage() {
  const db = createAnonSupabaseServer();
  const { data, error } = await db
    .from("sellers")
    .select("id, name, slug, user_id")
    .order("id", { ascending: false })
    .limit(300);

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Satıcılar</h1>
          <p className="mt-1 text-xs text-stone-400">Son 300 qeyd</p>
        </div>
        <Link href="/sellers" className="text-xs font-medium text-[#d4b87a] underline">
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
              <th className="px-3 py-2">user_id</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 bg-stone-950/40">
            {rows.map((r) => (
              <tr key={r.id} className="text-stone-200">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="max-w-[180px] truncate px-3 py-2">{r.name ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                  {r.slug ? (
                    <Link href={`/sellers/${encodeURIComponent(r.slug)}`} className="text-[#d4b87a] underline">
                      {r.slug}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-[220px] truncate px-3 py-2 font-mono text-[11px] text-stone-400">
                  {r.user_id ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
