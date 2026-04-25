import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export default async function AdminSecurityPage() {
  const svc = createServiceSupabaseAdmin();
  const usersRes = svc ? await svc.auth.admin.listUsers({ page: 1, perPage: 1000 }) : null;
  const users = usersRes?.data?.users ?? [];
  const recentSignIns = users.filter((u) => !!u.last_sign_in_at);
  const newUsers24h = users.filter((u) => !!u.created_at);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Təhlükəsizlik və Audit</h1>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="text-lg font-semibold text-stone-900">Giriş/Qeydiyyat</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Giriş etmiş istifadəçilər" value={String(recentSignIns.length)} />
            <Stat label="Qeydiyyatdan keçənlər" value={String(newUsers24h.length)} />
          </div>
        </section>
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="text-lg font-semibold text-stone-900">Sistem təhlükəsizlik görünüşü</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="Cəmi user" value={String(users.length)} />
            <Stat label="Email təsdiqli" value={String(users.filter((u) => !!u.email_confirmed_at).length)} />
            <Stat
              label="2FA aktiv"
              value={String(users.filter((u) => (((u as { factors?: unknown[] }).factors?.length ?? 0) > 0)).length)}
            />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Qeyd</h2>
        <div className="rounded-xl border border-[#e6e1d9] bg-white p-4 text-sm text-stone-600">
          Giriş xəritəsi/IP geolokasiya üçün ayrıca log cədvəli (məs: `security_login_logs`) lazımdır.
          Hazırda panel yalnız Supabase Auth real məlumatlarını göstərir.
        </div>
      </section>

      <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Audit Trail: Son Auth girişləri</h2>
        <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-2">İstifadəçi</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Tarix/Vaxt</th>
                <th className="px-3 py-2">Email təsdiqi</th>
                <th className="px-3 py-2">2FA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7de] text-stone-700">
              {recentSignIns.slice(0, 20).map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2">{u.email ?? "—"}</td>
                  <td className="max-w-[220px] truncate px-3 py-2 font-mono text-xs text-stone-500">{u.id}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("az-AZ") : "—"}
                  </td>
                  <td className="px-3 py-2">{u.email_confirmed_at ? "bəli" : "xeyr"}</td>
                  <td className="px-3 py-2">
                    {(((u as { factors?: unknown[] }).factors?.length ?? 0) > 0) ? "aktiv" : "yoxdur"}
                  </td>
                </tr>
              ))}
              {recentSignIns.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-stone-500" colSpan={5}>
                    Giriş qeydi tapılmadı və ya service role açarı yoxdur.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#ece7de] bg-white px-3 py-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
