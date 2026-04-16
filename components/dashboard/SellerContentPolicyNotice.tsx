import Link from "next/link";

export function SellerContentPolicyNotice() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 text-xs leading-relaxed text-neutral-600 shadow-sm sm:px-5 sm:text-[13px]">
        <p className="font-semibold text-neutral-800">Məzmun və hüquqlar</p>
        <p className="mt-2">
          Yüklədiyiniz məhsul təsviri, qiymət və şəkillərin düzgünlüyü və hüquqi
          uyğunluğu (müəllif hüququ, şəkil icazəsi, aldadıcı reklam yoxluğu)
          üzrə məsuliyyət sizə aiddir. Yalnız öz məhsulunuz və ya icazəsi olan
          materiallardan istifadə edin.
        </p>
        <p className="mt-2">
          <Link
            href="/terms"
            className="font-semibold text-amber-900 underline-offset-2 hover:underline"
          >
            İstifadə şərtləri
          </Link>
          <span className="mx-1.5 text-neutral-300">·</span>
          <Link
            href="/privacy"
            className="font-semibold text-amber-900 underline-offset-2 hover:underline"
          >
            Məxfilik siyasəti
          </Link>
        </p>
      </div>
    </div>
  );
}
