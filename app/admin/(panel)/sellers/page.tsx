import Link from "next/link";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import AdminSellerApprovalButton from "@/components/admin/AdminSellerApprovalButton";
import { createAnonSupabaseServer } from "@/lib/supabase-anon-server";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

type Row = {
  id: number;
  name: string | null;
  slug: string | null;
  user_id?: string | null;
  approval_status?: "pending" | "approved" | "rejected" | null;
};

export default async function AdminSellersPage() {
  const service = createServiceSupabaseAdmin();
  const db = service ?? createAnonSupabaseServer();
  const mode = service ? "service" : "anon";

  const { data, error } = await db
    .from("sellers")
    .select("id, name, slug, user_id, approval_status")
    .order("id", { ascending: false })
    .limit(300);

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Satıcı idarəetməsi</h1>
          <p className="mt-1 text-xs text-stone-500">
            Son 300 qeyd · oxuma: <span className="font-mono text-stone-700">{mode}</span>
          </p>
        </div>
        <Link href="/sellers" className="text-xs font-medium text-[#ff7a00] underline">
          Vitrinə bax
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
      ) : null}

      {mode === "service" ? (
        <p className="text-[11px] text-stone-500">
          &quot;Satıcı və hesabı sil&quot; məhsulları, satıcı sətrini və əlaqəli Supabase auth hesabını silir. Əməliyyat
          geri alınmaz.
        </p>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          Tam silmə üçün serverə <code className="rounded bg-white px-1 font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          əlavə edin.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
        <table className="min-w-full divide-y divide-[#ece7de] text-left text-sm">
          <thead className="bg-[#f8f8f6] text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">user_id</th>
              <th className="px-3 py-2">Status</th>
              {mode === "service" ? <th className="px-3 py-2">Əməliyyat</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efebe3] bg-white">
            {rows.map((r) => (
              <tr key={r.id} className="text-stone-700">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="max-w-[180px] truncate px-3 py-2">{r.name ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                  {r.slug ? (
                    <Link href={`/sellers/${encodeURIComponent(r.slug)}`} className="text-[#ff7a00] underline">
                      {r.slug}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-[220px] truncate px-3 py-2 font-mono text-[11px] text-stone-400">
                  {r.user_id ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs",
                      r.approval_status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.approval_status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700",
                    ].join(" ")}
                  >
                    {r.approval_status ?? "pending"}
                  </span>
                </td>
                {mode === "service" ? (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {r.approval_status !== "approved" ? (
                        <AdminSellerApprovalButton
                          endpoint={`/api/admin/sellers/${encodeURIComponent(String(r.id))}/approval`}
                          status="approved"
                          label="Qəbul et"
                          confirmText={`Satıcı #${r.id} üçün müraciəti qəbul etmək istəyirsiniz?`}
                        />
                      ) : null}
                      {r.approval_status !== "rejected" ? (
                        <AdminSellerApprovalButton
                          endpoint={`/api/admin/sellers/${encodeURIComponent(String(r.id))}/approval`}
                          status="rejected"
                          label="Rədd et"
                          confirmText={`Satıcı #${r.id} üçün müraciəti rədd etmək istəyirsiniz?`}
                        />
                      ) : null}
                      <AdminDeleteButton
                        actionLabel="Satıcı və hesabı sil"
                        confirmText={`Satıcı #${r.id} (${r.name ?? r.slug ?? "adsız"}), bütün məhsullarını və əlaqəli auth hesabını silmək? Əməliyyat geri alınmaz.`}
                        endpoint={`/api/admin/sellers/${encodeURIComponent(String(r.id))}`}
                      />
                    </div>
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
