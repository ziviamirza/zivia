import Link from "next/link";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Sifarişlər</h1>
          <p className="mt-1 text-xs text-stone-500">Son sifarişlər və icra statusları</p>
        </div>
        <Link href="/admin/users" className="text-xs font-medium text-[#ff7a00] underline">
          İstifadəçi qeydlərinə keç
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#ece7de] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f8f6] text-left text-xs uppercase text-stone-500">
            <tr>
              <th className="px-3 py-2">Sifariş ID</th>
              <th className="px-3 py-2">Müştəri</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Məbləğ</th>
              <th className="px-3 py-2">Tarix</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efebe3] text-stone-700">
            {[
              ["ORD-1120", "Emanat", "Zargar Eli", "$950", "25.04.2026", "Gözləyir"],
              ["ORD-1117", "Aysel", "Diamond Eli", "$410", "25.04.2026", "Təsdiqləndi"],
              ["ORD-1111", "Kamran", "Vendor", "$260", "24.04.2026", "Tamamlandı"],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, idx) => (
                  <td key={idx} className="whitespace-nowrap px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
