"use client";

import { useEffect, useState } from "react";
import {
  isFavoriteSlug,
  subscribeFavorites,
  toggleFavoriteSlug,
} from "@/lib/favorites-storage";

type Props = {
  slug: string;
  className?: string;
  /** kompakt: ProductCard; geniş: məhsul səhifəsi */
  size?: "sm" | "md";
};

export default function FavoriteHeartButton({ slug, className, size = "sm" }: Props) {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined") return false;
    const s = slug.trim();
    return s ? isFavoriteSlug(s) : false;
  });

  useEffect(() => {
    const s = slug.trim();
    if (!s) return;
    return subscribeFavorites(() => setOn(isFavoriteSlug(s)));
  }, [slug]);

  const s = slug.trim();
  if (!s) return null;

  const dim = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      title={on ? "Bəyənmədən çıxar" : "Bəyənilənlərə əlavə et"}
      aria-label={on ? "Bəyənmədən çıxar" : "Bəyənilənlərə əlavə et"}
      aria-pressed={on}
      onClick={() => {
        const next = toggleFavoriteSlug(s);
        setOn(next);
      }}
      className={
        className ??
        `inline-flex ${dim} items-center justify-center rounded-full border border-[#deceb2] bg-white text-[#7b5f2f] transition hover:bg-[#f6efe3] ${on ? "text-red-600" : ""}`
      }
    >
      <svg className={icon} viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} aria-hidden>
        <path
          d="M12 21s-6.5-4.35-9-8.4A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9 6.6C18.5 16.65 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
