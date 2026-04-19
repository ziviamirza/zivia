"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { readFavoriteSlugs, subscribeFavorites } from "@/lib/favorites-storage";
import { primaryProductImageUrl } from "@/lib/product-images";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: string | number;
  title: string | null;
  category: string | null;
  price: number | string | null;
  slug: string | null;
  image?: string | null;
  images?: unknown;
};

export default function FavoritesPage() {
  const [hydrated, setHydrated] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sync = useCallback(() => setSlugs(readFavoriteSlugs()), []);

  useEffect(() => {
    setHydrated(true);
    sync();
  }, [sync]);

  useEffect(() => {
    if (!hydrated) return;
    return subscribeFavorites(sync);
  }, [hydrated, sync]);

  useEffect(() => {
    if (!hydrated || slugs.length === 0) {
      setRows([]);
      setErr(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErr(null);
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, title, category, price, slug, image, images")
        .in("slug", slugs);
      if (cancelled) return;
      setLoading(false);
      if (error) {
        setErr("Məhsullar yüklənmədi.");
        setRows([]);
        return;
      }
      setRows((data ?? []) as Row[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, slugs]);

  const bySlug = useMemo(() => {
    const m = new Map<string, Row>();
    for (const r of rows) {
      if (r.slug) m.set(r.slug, r);
    }
    return m;
  }, [rows]);

  const ordered = useMemo(() => {
    return slugs.map((s) => bySlug.get(s)).filter((r): r is Row => Boolean(r));
  }, [slugs, bySlug]);

  if (!hydrated) {
    return (
      <div className="space-y-3 px-3 py-4 md:px-4">
        <h1 className="font-display text-2xl text-stone-900">Bəyəndiklərim</h1>
        <p className="text-sm text-stone-500">Yüklənir…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3 py-4 md:px-4 lg:px-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl leading-none text-stone-900 md:text-4xl">
            Bəyəndiklərim
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Seçimləriniz bu brauzerdə saxlanılır.
          </p>
        </div>
        <Link href="/products" className="text-sm font-medium text-[#8b6b2c]">
          Məhsullara keç
        </Link>
      </div>

      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{err}</p>
      ) : null}

      {loading && slugs.length > 0 ? (
        <p className="text-xs text-stone-500">Yenilənir…</p>
      ) : null}

      {slugs.length === 0 ? (
        <div className="app-surface p-6 text-center">
          <p className="text-stone-700">Hələ bəyəndiyiniz məhsul yoxdur.</p>
          <p className="mt-2 text-sm text-stone-500">
            Məhsul kartında və ya məhsul səhifəsində ürək işarəsinə toxunun.
          </p>
          <Link href="/products" className="app-btn-primary mt-4 inline-flex justify-center px-5">
            Məhsullara bax
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {ordered.map((p) => (
            <ProductCard
              key={String(p.id)}
              title={p.title ?? "—"}
              category={p.category ?? "—"}
              price={Number(p.price ?? 0)}
              slug={p.slug ?? undefined}
              imageUrl={primaryProductImageUrl(p)}
            />
          ))}
        </div>
      )}

      {slugs.length > 0 && ordered.length < slugs.length ? (
        <p className="text-sm text-amber-800">
          Bəzi məhsullar artıq vitrində deyil və ya silinib.
        </p>
      ) : null}
    </div>
  );
}
