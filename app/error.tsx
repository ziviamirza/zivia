"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-[2rem] border border-amber-100 bg-white/95 p-8 text-center shadow-[0_20px_40px_-30px_rgba(83,56,28,0.45)]">
        <h1 className="text-xl font-bold text-stone-900">Xəta baş verdi</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Səhifə göstərilərkən gözlənilməz problem yarandı. Zəhmət olmasa
          yenidən cəhd edin və ya ana səhifəyə qayıdın.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="zivia-btn-primary rounded-2xl px-5"
          >
            Yenidən cəhd et
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-amber-100 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50/40"
          >
            Ana səhifə
          </Link>
        </div>
      </div>
    </div>
  );
}
