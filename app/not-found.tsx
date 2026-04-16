import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/90">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl text-stone-900 sm:text-4xl">
        Səhifə tapılmadı
      </h1>
      <p className="mt-3 max-w-md text-sm text-stone-600">
        Axtardığınız ünvan mövcud deyil və ya köçürülüb. Ana səhifəyə qayıdın
        və ya məhsul vitrininə baxın.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="zivia-btn-primary rounded-2xl px-5">
          Ana səhifə
        </Link>
        <Link
          href="/products"
          className="rounded-2xl border border-amber-100 bg-white px-5 py-3 text-sm font-semibold text-stone-800"
        >
          Məhsullar
        </Link>
      </div>
    </div>
  );
}
