import Link from "next/link";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

type Row = {
  id: number;
  name: string | null;
  slug: string | null;
  user_id?: string | null;
};

export default async function AdminSellersPage() {
  const service = createServiceSupabaseAdmin();
  const db = service ?? createAnonSupabaseServer();
  const mode = service ? "service" : "anon";

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
          <p className="mt-1 text-xs text-stone-400">
            Son 300 qeyd · oxuma: <span className="font-mono text-[#d4b87a]">{mode}</span>
          </p>
        </div>
        <Link href="/sellers" className="text-xs font-medium text-[#d4b87a] underline">
          Vitrinə bax
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-200">{error.message}</p>
      ) : null}

      {mode === "service" ? (
        <p className="text-[11px] text-stone-500">
          &quot;Satıcı və hesabı sil&quot; məhsulları, satıcı sətrini və əlaqəli Supabase auth hesabını silir. Əməliyyat
          geri alınmaz.
        </p>
      ) : (
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-[11px] text-amber-100/90">
          Tam silmə üçün serverə <code className="rounded bg-black/30 px-1 font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          əlavə edin.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-700">
        <table className="min-w-full divide-y divide-stone-700 text-left text-sm">
          <thead className="bg-stone-900/80 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">user_id</th>
              {mode === "service" ? <th className="px-3 py-2">Əməliyyat</th> : null}
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
                {mode === "service" ? (
                  <td className="px-3 py-2">
                    <AdminDeleteButton
                      actionLabel="Satıcı və hesabı sil"
                      confirmText={`Satıcı #${r.id} (${r.name ?? r.slug ?? "adsız"}), bütün məhsullarını və əlaqəli auth hesabını silmək? Əməliyyat geri alınmaz.`}
                      endpoint={`/api/admin/sellers/${encodeURIComponent(String(r.id))}`}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
