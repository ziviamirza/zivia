import Link from "next/link";
import type { Seller } from "@/types";

type Props = {
  seller: Seller & {
    rating?: number;
    previewImages?: string[];
  };
};

export function SellerCard({ seller }: Props) {
  const stars = seller.rating ?? 4.8;
  const previews = seller.previewImages ?? [];

  return (
    <article className="app-surface w-[236px] shrink-0 p-3 transition hover:-translate-y-0.5">
      <Link href={`/sellers/${seller.slug}`} className="block">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-stone-200 ring-2 ring-[#f1e7d8]">
            {seller.avatar?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={seller.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#eadfcf] to-[#ccb48b]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{seller.name}</p>
            <p className="text-[11px] text-[#8b6b2c]">{"★".repeat(5)} {stars.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {previews.length ? (
            previews.slice(0, 3).map((image, idx) => (
              <div key={`${image}-${idx}`} className="aspect-square overflow-hidden rounded-lg bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))
          ) : (
            <div className="col-span-3 h-16 rounded-lg bg-stone-100" />
          )}
        </div>
      </Link>
      <div className="mt-3">
        <Link
          href={`/sellers/${seller.slug}`}
          className="app-btn-primary w-full justify-center rounded-lg py-2 text-xs"
        >
          Ziyarət et
        </Link>
      </div>
    </article>
  );
}
