"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type HomeHeroSlideView = {
  id: number;
  src: string;
  alt: string;
  linkUrl?: string | null;
};

const FALLBACK_SLIDES: HomeHeroSlideView[] = [
  { id: 1, src: "https://images.unsplash.com/photo-1611652022419-a9419f74343d", alt: "Zinət boyunbağı", linkUrl: "/products" },
  { id: 2, src: "https://images.unsplash.com/photo-1515562140567-58e285261111", alt: "Üzük kolleksiyası", linkUrl: "/products" },
  { id: 3, src: "https://images.unsplash.com/photo-1617038220319-276d3cfab638", alt: "Boyunbağı detalı", linkUrl: "/products" },
  { id: 4, src: "https://images.unsplash.com/photo-1598560917505-59a3ad559071", alt: "Üzük və zərgərlik", linkUrl: "/products" },
  { id: 5, src: "https://images.unsplash.com/photo-1601821765780-754fa98637c1", alt: "Bilərzik", linkUrl: "/products" },
];

function scrollThumbClass(active: boolean) {
  return active
    ? "h-1.5 w-5 rounded-full bg-white shadow-sm transition-[width,background-color] duration-200"
    : "h-1.5 w-1.5 rounded-full bg-white/65 transition-[width,background-color] duration-200 hover:bg-white/85";
}

function ctaHref(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (!t) return "/products";
  if (t.startsWith("/")) return t.startsWith("//") ? "/products" : t;
  if (/^https?:\/\//i.test(t)) return t;
  return `/${t}`;
}

function HeroCta({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const h = ctaHref(href);
  if (/^https?:\/\//i.test(h)) {
    return (
      <a href={h} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={h} className={className}>
      {children}
    </Link>
  );
}

export default function HomeHeroCarousel({ slides }: { slides: HomeHeroSlideView[] }) {
  const resolved = useMemo(
    () => (slides.length > 0 ? slides : FALLBACK_SLIDES),
    [slides],
  );
  const count = resolved.length;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Record<number, true>>({});

  useEffect(() => {
    setActive((a) => Math.min(Math.max(0, a), Math.max(0, count - 1)));
  }, [count]);

  const syncFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w < 1) return;
    const i = Math.round(el.scrollLeft / w);
    setActive(Math.min(count - 1, Math.max(0, i)));
  }, [count]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncFromScroll();
    el.addEventListener("scroll", syncFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", syncFromScroll);
  }, [syncFromScroll]);

  useEffect(() => {
    const onResize = () => syncFromScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncFromScroll]);

  function goTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.min(count - 1, Math.max(0, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  const activeLink = resolved[active]?.linkUrl;

  return (
    <section
      className="relative overflow-hidden rounded-3xl"
      aria-roledescription="carousel"
      aria-label="Zivia — əsas şəkillər"
    >
      <div
        ref={scrollerRef}
        className="flex h-[210px] touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] md:h-[250px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(active - 1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(active + 1);
          }
        }}
      >
        {resolved.map((slide, index) => (
          <div
            key={slide.id}
            className="relative h-full min-w-full shrink-0 snap-start select-none bg-gradient-to-br from-stone-300 via-stone-200 to-amber-100/90"
          >
            {broken[slide.id] ? (
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#4a3f35] via-[#5c4d3f] to-[#7a6548]"
                aria-hidden
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                draggable={false}
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
                quality={85}
                onError={() => setBroken((b) => ({ ...b, [slide.id]: true }))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white">
        <h1 className="font-display text-[1.9rem] leading-[1.05] md:text-[2.35rem]">Zivia ilə öz stilini tap</h1>
        <p className="mt-1 text-xs text-white/90 md:text-sm">Minlərlə unikal bijuteriya</p>
        <HeroCta
          href={activeLink ?? "/products"}
          className="pointer-events-auto mt-3 inline-flex rounded-lg bg-[#b08a42] px-4 py-2 text-xs font-medium text-white md:text-sm"
        >
          Kəşf et
        </HeroCta>
        <div
          className="pointer-events-auto mt-3 flex items-center justify-start gap-0.5"
          role="tablist"
          aria-label={`Slaydlar — cəmi ${count}`}
        >
          {resolved.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slayd ${i + 1} / ${count}`}
              className="flex min-h-11 min-w-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              onClick={() => goTo(i)}
            >
              <span className={scrollThumbClass(i === active)} aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
