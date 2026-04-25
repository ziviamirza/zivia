import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

type Search = Promise<{ page?: string }>;

export default async function AdminUsersPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(500, Number.parseInt(sp.page ?? "1", 10) || 1));
  const perPage = 40;

  const svc = createServiceSupabaseAdmin();
  if (!svc) {
    return (
      <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-5 text-sm text-amber-100">
        <p className="font-semibold text-amber-50">Auth istifadəçilərini görmək üçün</p>
        <p className="mt-2 text-amber-100/90">
          Server mühitinə <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          əlavə edin və yenidən deploy edin.
        </p>
      </div>
    );
  }

  const { data, error } = await svc.auth.admin.listUsers({ page, perPage });

  if (error) {
    return (
      <p className="rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">{error.message}</p>
    );
  }

  const users = data?.users ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Auth istifadəçiləri</h1>
        <p className="mt-1 text-xs text-stone-400">
          Supabase qeydiyyatı — səhifə {page}, səhifədə {perPage}. Silmə geri alınmır.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {page > 1 ? (
          <a
            href={`/admin/users?page=${page - 1}`}
            className="rounded-lg border border-stone-600 px-3 py-1.5 text-stone-300 hover:bg-stone-800"
          >
            ← Əvvəlki
          </a>
        ) : null}
        {users.length === perPage ? (
          <a
            href={`/admin/users?page=${page + 1}`}
            className="rounded-lg border border-stone-600 px-3 py-1.5 text-stone-300 hover:bg-stone-800"
          >
            Növbəti →
          </a>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-700">
        <table className="min-w-full divide-y divide-stone-700 text-left text-sm">
          <thead className="bg-stone-900/80 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">E-poçt</th>
              <th className="px-3 py-2">UUID</th>
              <th className="px-3 py-2">Yaradılıb</th>
              <th className="px-3 py-2">Son giriş</th>
              <th className="px-3 py-2">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 bg-stone-950/40">
            {users.map((u) => (
              <tr key={u.id} className="text-stone-200">
                <td className="max-w-[200px] truncate px-3 py-2 text-xs">{u.email ?? "—"}</td>
                <td className="max-w-[120px] truncate px-3 py-2 font-mono text-[10px] text-stone-400">{u.id}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-stone-400">
                  {u.created_at ? new Date(u.created_at).toLocaleString("az-AZ") : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-stone-400">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("az-AZ") : "—"}
                </td>
                <td className="px-3 py-2">
                  <AdminDeleteButton
                    actionLabel="Hesabı sil"
                    confirmText={`Bu auth hesabını və satıcı/məhsul əlaqələrini silmək istəyirsiniz?\n\n${u.email ?? u.id}\n\nƏməliyyat geri alınmaz.`}
                    endpoint={`/api/admin/users/${encodeURIComponent(u.id)}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
