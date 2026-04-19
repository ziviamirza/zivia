import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteHeartButton from "@/components/FavoriteHeartButton";
import { formatAzn } from "@/lib/format";

type Props = {
  title: string;
  category: string;
  price: number;
  slug?: string;
  imageUrl?: string | null;
};

export default function ProductCard({
  title,
  category,
  price,
  slug,
  imageUrl,
}: Props) {
  const href = slug ? `/products/${slug}` : "#";
  const raw = imageUrl?.trim() ?? "";
  const showImg = raw.startsWith("http://") || raw.startsWith("https://");

  return (
    <article className="app-surface overflow-hidden p-2 transition hover:-translate-y-0.5">
      <Link href={href} className="block">
        <div className="relative aspect-[1/1.05] overflow-hidden rounded-xl bg-neutral-100">
          {showImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={raw}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
              Şəkil yoxdur
            </div>
          )}
        </div>
      </Link>
      <div className="px-1.5 pb-1.5 pt-2">
        <Link href={href} className="line-clamp-1 text-sm font-semibold text-stone-900">
          {title}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">{category}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-[#7a5b24]">{formatAzn(price)}</p>
          {slug ? (
            <span className="flex shrink-0 items-center gap-1">
              <FavoriteHeartButton slug={slug} />
              <AddToCartButton slug={slug} goToCart title="Səbətə əlavə et və səbətə keç" />
            </span>
          ) : (
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-stone-400"
              aria-hidden
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h2l1.2 8a1 1 0 0 0 1 .9h8.4a1 1 0 0 0 1-.8L19 9H7.1"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
