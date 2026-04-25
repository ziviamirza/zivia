export default function AdminSecurityPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Təhlükəsizlik və Audit</h1>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="text-lg font-semibold text-stone-900">Son 24 Saat Giriş</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Admin" value="45" />
            <Stat label="Vendor" value="120" />
          </div>
        </section>
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="text-lg font-semibold text-stone-900">Təhlükəsizlik Xəbərdarlıqları</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat label="Low" value="2" />
            <Stat label="Medium" value="1" />
            <Stat label="High" value="0" />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Canlı Giriş Xəritəsi</h2>
        <div className="h-40 rounded-xl border border-[#e6e1d9] bg-[radial-gradient(circle_at_20%_20%,#f3f3f1,transparent_40%),radial-gradient(circle_at_70%_60%,#f1f0ec,transparent_35%),#fff]" />
      </section>

      <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Audit Trail: Mühüm Fəaliyyətlər</h2>
        <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-2">Fəaliyyət</th>
                <th className="px-3 py-2">Kim</th>
                <th className="px-3 py-2">Tarix/Vaxt</th>
                <th className="px-3 py-2">Cihaz/IP</th>
                <th className="px-3 py-2">Detallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7de] text-stone-700">
              <tr>
                <td className="px-3 py-2">Vendor təsdiqləndi</td>
                <td className="px-3 py-2">Admin Name</td>
                <td className="px-3 py-2">23.01.2023</td>
                <td className="px-3 py-2">122.16.87.021</td>
                <td className="px-3 py-2">Bax</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Qiymət dəyişdirildi</td>
                <td className="px-3 py-2">Vendor</td>
                <td className="px-3 py-2">23.01.2023</td>
                <td className="px-3 py-2">122.16.03.23</td>
                <td className="px-3 py-2">Bax</td>
              </tr>
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
