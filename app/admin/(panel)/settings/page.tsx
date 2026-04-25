export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Qlobal Ayarlar və Sistemin Fərdiləşdirilməsi</h1>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="text-lg font-semibold text-stone-900">Qlobal Komissiya Dərəcəsi</h2>
          <p className="mt-1 text-4xl font-semibold">10%</p>
          <input type="range" min="1" max="25" defaultValue="10" className="mt-5 w-full accent-[#ff7a00]" />
        </section>

        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Ödəniş Gateway İnteqrasiyası</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">Enable</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {["Bank Card", "Apple Pay", "Mastercard", "GPay"].map((gateway) => (
              <span key={gateway} className="rounded-lg border border-[#e6e1d9] bg-white px-3 py-2">
                {gateway}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Email Şablonları</h2>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {[
              "Yeni Sifariş",
              "Qeydiyyat Təsdiqi",
              "Qaytarma Sorğusu",
              "Satıcı Aktivləşməsi",
              "Ödəniş Bildirişi",
              "Sistem Xəbərdarlığı",
            ].map((template) => (
              <button
                key={template}
                type="button"
                className="rounded-xl border border-[#e6e1d9] bg-white px-3 py-2 text-left hover:bg-stone-50"
              >
                {template}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#ece7de] bg-[#fcfcfb] p-4">
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Baxım Rejimi (Maintenance Mode)</h2>
          <div className="rounded-xl border border-[#e6e1d9] bg-white p-3">
            <p className="text-sm text-stone-600">Status</p>
            <p className="mt-1 font-semibold text-stone-900">Qeyri-aktiv</p>
            <button
              type="button"
              className="mt-3 rounded-xl bg-[#ff7a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#ef7300]"
            >
              Aktivləşdir
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
