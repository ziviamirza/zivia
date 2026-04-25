export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Analitika</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Yeni Sifarişlər" value="145" delta="-2.3%" negative />
        <Card title="Yeni Satıcı Müraciətləri" value="28" delta="+5%" />
        <Card title="Orta Səbət" value="$278" delta="+3.2%" />
        <Card title="Dönüşüm" value="4.9%" delta="+0.4%" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-stone-900">Həftəlik Satış Trendi</h2>
          <div className="relative h-44 rounded-xl border border-[#ece7de] bg-white">
            <svg viewBox="0 0 600 180" className="absolute inset-0 h-full w-full p-3 text-stone-900">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                points="20,150 95,100 160,70 240,120 320,80 410,112 500,68 560,20"
              />
            </svg>
          </div>
        </section>
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 font-semibold text-stone-900">Son Fəaliyyətlər</h2>
          <ul className="space-y-2 text-sm text-stone-700">
            <li className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">Qiymət düzəlişi edildi</li>
            <li className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">Sifariş qaytarıldı</li>
            <li className="rounded-lg border border-[#ece7de] bg-white px-3 py-2">Yeni vendor təsdiqləndi</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  delta,
  negative,
}: {
  title: string;
  value: string;
  delta: string;
  negative?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] px-4 py-4">
      <p className="text-sm text-stone-600">{title}</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight text-stone-900">{value}</p>
      <p className={["mt-1 text-sm font-medium", negative ? "text-red-600" : "text-emerald-600"].join(" ")}>{delta}</p>
    </div>
  );
}
