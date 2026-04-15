import Link from "next/link";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m12 3 1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m21 21-4.4-4.4M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20.3c-.3 0-.6-.1-.8-.3l-1.8-1.6c-3.8-3.5-6.2-5.7-6.2-8.5A5 5 0 0 1 8.2 5c1.5 0 3 .7 3.8 1.8A5 5 0 0 1 15.8 5a5 5 0 0 1 5 4.9c0 2.8-2.4 5-6.2 8.5L12.8 20c-.2.2-.5.3-.8.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2.2c.8 0 1.4.5 1.6 1.3L7.5 8m0 0h12.2l-1.3 5.3c-.2.8-.9 1.4-1.7 1.4H9.2c-.8 0-1.5-.6-1.7-1.4L6 7m1.5 1 1.1 5M10 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 10 20Zm7 0a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 17 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Badge({ count }: { count: string }) {
  return (
    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-semibold text-white">
      {count}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-amber-100/70 bg-[var(--zivia-cream)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,248,237,0.9),transparent_52%),radial-gradient(circle_at_88%_15%,rgba(252,236,214,0.75),transparent_48%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-18">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="zivia-section-eyebrow inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/90 px-4 py-2">
              <SparkleIcon className="h-3.5 w-3.5 text-amber-700" />
              Premium zərgərlik bazarı
            </p>
            <h1 className="mt-5 font-display text-[2.2rem] leading-[1.08] tracking-tight text-stone-900 sm:text-[3rem]">
              Zərif parçaları kəşf et, stilini Zivia ilə tamamla
            </h1>
            <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-stone-600 sm:text-base">
              Seçilmiş satıcılar, yumşaq butik təcrübəsi və rahat filtr sistemi ilə
              zərgərlik alışını daha estetik və sadə etdik.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="zivia-btn-hero-primary">
                Kolleksiyaya bax
              </Link>
              <Link href="/register" className="zivia-btn-hero-secondary">
                Satıcı kimi qoşul
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                  Satıcı
                </p>
                <p className="mt-1.5 font-display text-2xl text-stone-900">20+</p>
              </div>
              <div className="rounded-2xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                  Məhsul
                </p>
                <p className="mt-1.5 font-display text-2xl text-stone-900">500+</p>
              </div>
              <div className="rounded-2xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                  Şəhər
                </p>
                <p className="mt-1.5 font-display text-2xl text-stone-900">Bakı</p>
              </div>
            </div>
          </div>

          <div className="zivia-panel relative p-4 sm:p-5">
            <div className="rounded-2xl border border-amber-100 bg-[var(--zivia-warm-white)] p-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-[1.4rem] text-stone-900">Zivia</p>
                <div className="flex items-center gap-2 text-stone-500">
                  <HeartIcon className="h-4 w-4" />
                  <UserIcon className="h-4 w-4" />
                  <div className="relative">
                    <CartIcon className="h-4 w-4" />
                    <Badge count="3" />
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-white px-3 py-2 text-[12px] text-stone-500">
                  <SearchIcon className="h-3.5 w-3.5 text-stone-400" />
                  Zərgərlik axtar...
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-stone-700 via-stone-600 to-stone-500 px-4 py-4 text-white">
                  <p className="font-display text-[1.25rem] leading-tight">
                    Zivia ilə öz stilini seç
                  </p>
                  <p className="mt-1 text-[11px] text-amber-50/90">
                    Butik satıcılardan seçilmiş vitrin
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                    Kəşf et
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Populyar satıcılar
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-amber-100 bg-white p-2">
                      <p className="text-[12px] font-semibold text-stone-800">
                        MoonShine
                      </p>
                      <p className="text-[10px] text-amber-600">★★★★★</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-white p-2">
                      <p className="text-[12px] font-semibold text-stone-800">
                        OoidSöiter
                      </p>
                      <p className="text-[10px] text-amber-600">★★★★★</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Yeni məhsullar
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-amber-100 bg-white p-2">
                      <div className="h-12 rounded-lg bg-gradient-to-br from-amber-100 to-stone-100" />
                      <p className="mt-1 text-[11px] text-stone-700">Oval üzük</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-white p-2">
                      <div className="h-12 rounded-lg bg-gradient-to-br from-stone-100 to-amber-100" />
                      <p className="mt-1 text-[11px] text-stone-700">İnci sırğa</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
