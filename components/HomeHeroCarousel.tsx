"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1600&q=80",
    alt: "Zinət boyunbağı",
  },
  {
    src: "https://images.unsplash.com/photo-1515562140567-58e285261111?auto=format&fit=crop&w=1600&q=80",
    alt: "Üzük kolleksiyası",
  },
  {
    src: "https://images.unsplash.com/photo-1599643478518-a784e5d4f0f8?auto=format&fit=crop&w=1600&q=80",
    alt: "Qolbaq və bilərzik",
  },
  {
    src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
    alt: "Sırğalar",
  },
  {
    src: "https://images.unsplash.com/photo-1617038260897-41a5fabefd2d?auto=format&fit=crop&w=1600&q=80",
    alt: "Zərgərlik detalları",
  },
] as const;

function scrollThumbClass(active: boolean) {
  return active
    ? "h-1.5 w-5 rounded-full bg-white shadow-sm transition-[width,background-color] duration-200"
    : "h-1.5 w-1.5 rounded-full bg-white/65 transition-[width,background-color] duration-200 hover:bg-white/85";
}

export default function HomeHeroCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const syncFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w < 1) return;
    const i = Math.round(el.scrollLeft / w);
    setActive(Math.min(HERO_SLIDES.length - 1, Math.max(0, i)));
  }, []);

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
    const clamped = Math.min(HERO_SLIDES.length - 1, Math.max(0, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

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
        {HERO_SLIDES.map((slide) => (
          <div
            key={slide.src}
            className="relative h-full min-w-full shrink-0 snap-start select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              className="h-full w-full object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white">
        <h1 className="font-display text-[1.9rem] leading-[1.05] md:text-[2.35rem]">Zivia ilə öz stilini tap</h1>
        <p className="mt-1 text-xs text-white/90 md:text-sm">Minlərlə unikal bijuteriya</p>
        <Link
          href="/products"
          className="pointer-events-auto mt-3 inline-flex rounded-lg bg-[#b08a42] px-4 py-2 text-xs font-medium text-white md:text-sm"
        >
          Kəşf et
        </Link>
        <div
          className="pointer-events-auto mt-3 flex items-center justify-start gap-0.5"
          role="tablist"
          aria-label="Slayd göstəriciləri"
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slayd ${i + 1} / ${HERO_SLIDES.length}`}
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
