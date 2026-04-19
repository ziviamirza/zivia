"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart-storage";

type Props = {
  slug: string;
  className?: string;
  /** true: əlavə etdikdən sonra /cart-a keç */
  goToCart?: boolean;
  title?: string;
  children?: ReactNode;
};

export default function AddToCartButton({
  slug,
  className,
  goToCart = false,
  title = "Səbətə əlavə et",
  children,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (goToCart) router.prefetch("/cart");
  }, [goToCart, router]);

  const icon = (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h2l1.2 8a1 1 0 0 0 1 .9h8.4a1 1 0 0 0 1-.8L19 9H7.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={() => {
        const s = slug.trim();
        if (!s) return;
        addToCart(s, 1);
        if (goToCart) router.push("/cart");
      }}
      className={
        className ??
        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--zivia-gold-strong)] text-white transition hover:bg-[var(--zivia-gold)]"
      }
    >
      {children ? (
        <>
          {icon}
          {children}
        </>
      ) : (
        icon
      )}
    </button>
  );
}
