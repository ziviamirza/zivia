import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { SellerCard } from "@/components/SellerCard";
import { primaryProductImageUrl, productRowImageUrls } from "@/lib/product-images";
import { supabase } from "@/lib/supabase";
import type { Seller } from "@/types";

export const metadata: Metadata = {
  title: "Ana səhifə",
  description:
    "Zivia — TikTok və Instagram zərgərlik satıcılarını birləşdirən premium marketplace. Kateqoriyalar, seçilmiş məhsullar və satıcı profilləri.",
};

export default async function Home() {
  const { data: productRows } = await supabase
    .from("products")
    .select("id, title, category, price, slug, image, images, seller_id")
    .order("id", { ascending: false })
    .limit(24);

  const list = productRows ?? [];
  const newArrivals = list.slice(0, 8);

  const { data: sellerRows } = await supabase
    .from("sellers")
    .select("id, slug, name, description, avatar")
    .order("id", { ascending: false })
    .limit(8);

  const topSellers = (sellerRows ?? [])
    .filter((r): r is typeof r & { slug: string } => Boolean(r?.slug))
    .map((r) => ({
      id: String(r.id),
      slug: r.slug,
      name: r.name,
      tagline: "Zivia satıcısı",
      description: r.description ?? "",
      avatar: r.avatar?.trim() || "",
      whatsapp: "",
    })) as Seller[];

  const previewsBySellerId = new Map<number, string[]>();
  for (const row of list) {
    const sellerId = Number(row.seller_id);
    if (!Number.isFinite(sellerId)) continue;
    const current = previewsBySellerId.get(sellerId) ?? [];
    for (const image of productRowImageUrls(row)) {
      if (current.length >= 3) break;
      if (!current.includes(image)) current.push(image);
    }
    previewsBySellerId.set(sellerId, current);
  }

  return (
    <div className="space-y-6 px-3 pt-3 md:px-4 lg:px-5">
      <section className="relative overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=80"
          alt=""
          className="h-[210px] w-full object-cover md:h-[250px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h1 className="font-display text-[1.9rem] leading-[1.05] md:text-[2.35rem]">Zivia ilə öz stilini tap</h1>
          <p className="mt-1 text-xs text-white/90 md:text-sm">Minlərlə unikal bijuteriya</p>
          <Link href="/products" className="mt-3 inline-flex rounded-lg bg-[#b08a42] px-4 py-2 text-xs font-medium text-white md:text-sm">
            Kəşf et
          </Link>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 w-5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/65" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/65" />
          </div>
        </div>
      </section>

      <section id="populyar-saticilar">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900 md:text-lg">Populyar satıcılar</h2>
          <Link href="/sellers" className="text-xs font-medium text-[#8b6b2c]">
            Hamısı
          </Link>
        </div>
        <div className="app-scroll-x -mx-3 flex gap-3 px-3 pb-1">
          {topSellers.length ? (
            topSellers.map((s) => (
              <SellerCard
                key={s.id}
                seller={{
                  ...s,
                  previewImages: previewsBySellerId.get(Number(s.id)) ?? [],
                }}
              />
            ))
          ) : (
            <div className="app-surface w-full p-4 text-sm text-stone-500">
              Satıcılar qeydiyyatdan keçdikcə burada görünəcək.
            </div>
          )}
        </div>
      </section>

      <section id="yeni-mehsullar" className="pb-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900 md:text-lg">Yeni məhsullar</h2>
          <Link href="/products" className="text-xs font-medium text-[#8b6b2c]">
            Hamısına bax
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.length ? (
            newArrivals.map((p) => (
              <ProductCard
                key={String(p.id)}
                title={p.title ?? "—"}
                category={p.category ?? "—"}
                price={Number(p.price ?? 0)}
                slug={p.slug ?? undefined}
                imageUrl={primaryProductImageUrl(p)}
              />
            ))
          ) : (
            <p className="col-span-2 app-surface p-4 text-sm text-stone-500">
              Məhsullar əlavə olunduqca burada görünəcək.
            </p>
          )}
        </div>
      </section>

      <section className="app-surface p-4">
        <p className="text-sm text-stone-600">
          Premium marketplace təcrübəsi üçün vitrin tam mobil ölçüdə optimizasiya edildi.
          Satıcı, məhsul və hesab əməliyyatlarının hamısı eyni işləyir.
        </p>
      </section>
    </div>
  );
}
