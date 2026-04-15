import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { Hero } from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { SellerCard } from "@/components/SellerCard";
import { categories } from "@/data/categories";
import { primaryProductImageUrl } from "@/lib/product-images";
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
    .select("id, title, category, price, slug, image, images")
    .order("id", { ascending: false })
    .limit(8);

  const list = productRows ?? [];
  const featured = list.slice(0, 4);
  const newArrivals = list.slice(4, 8);

  const { data: sellerRows } = await supabase
    .from("sellers")
    .select("id, slug, name, description, avatar")
    .order("id", { ascending: false })
    .limit(4);

  const topSellers: Seller[] = (sellerRows ?? [])
    .filter((r): r is typeof r & { slug: string } => Boolean(r?.slug))
    .map((r) => ({
      id: String(r.id),
      slug: r.slug,
      name: r.name,
      tagline: "Zivia satıcısı",
      description: r.description ?? "",
      avatar: r.avatar?.trim() || "",
      whatsapp: "",
    }));

  return (
    <>
      <Hero />

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
            <div className="max-w-2xl">
              <p className="zivia-section-eyebrow">Kateqoriyalar</p>
              <h2 className="zivia-section-title mt-4">Üslubunu seç</h2>
              <p className="zivia-section-desc">
                Hər kateqoriya diqqətlə seçilmiş satıcılarla doludur — minimal
                zəriflikdən xüsusi günlərə qədər.
              </p>
            </div>
            <Link
              href="/products"
              className="zivia-link-quiet shrink-0 self-start sm:self-auto"
            >
              Bütün məhsullar
            </Link>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-amber-900/[0.06] bg-gradient-to-b from-[var(--zivia-warm-white)] via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="zivia-section-eyebrow">Seçilmişlər</p>
              <h2 className="zivia-section-title mt-4">Bu həftənin işıltısı</h2>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 self-start text-[13px] font-medium tracking-wide text-stone-600 transition hover:text-amber-900 sm:self-auto"
            >
              Hamısına bax
              <span className="translate-x-0 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <div className="mt-14 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-4 lg:gap-7">
            {featured.length ? (
              featured.map((p) => (
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
              <p className="col-span-full text-sm text-stone-500">
                Hələ vitrin məhsulu yoxdur — satıcı panelindən əlavə edin.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="zivia-section-eyebrow">Yeni gəlişlər</p>
            <h2 className="zivia-section-title mt-4">Təzə vitrin</h2>
            <p className="zivia-section-desc">
              Satıcıların ən son əlavə etdiyi parçalar — tez tükənən kiçik
              seriyalar.
            </p>
          </div>
          <div className="mt-14 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-4 lg:gap-7">
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
            ) : featured.length ? null : (
              <p className="col-span-full text-sm text-stone-500">
                Daha çox məhsul əlavə olunduqca burada görünəcək.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-amber-900/[0.04] bg-[var(--zivia-cream)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="zivia-section-eyebrow">Top satıcılar</p>
            <h2 className="zivia-section-title mt-4">
              İnstagram və TikTok ulduzları
            </h2>
            <p className="zivia-section-desc">
              Hər profil real hekayə ilə: kim hazırlayır, necə sifariş verilir,
              hansı materiallardan istifadə olunur.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
            {topSellers.length ? (
              topSellers.map((s) => <SellerCard key={s.id} seller={s} />)
            ) : (
              <p className="text-sm text-stone-500">
                Satıcılar qeydiyyatdan keçdikcə burada görünəcək.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="zivia-surface grid gap-5 p-6 sm:grid-cols-3 sm:gap-6 sm:p-8">
            <div>
              <p className="zivia-section-eyebrow">Etibar</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Hər satıcı əl ilə yoxlanılır və butik standartına uyğun seçilir.
              </p>
            </div>
            <div>
              <p className="zivia-section-eyebrow">Şəffaflıq</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Material, qiymət və sifariş məlumatları aydın, sadə və görünəndir.
              </p>
            </div>
            <div>
              <p className="zivia-section-eyebrow">Rahat sifariş</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Məhsuldan satıcıya keçid bir toxunuşla — WhatsApp ilə birbaşa əlaqə.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-24 pt-4 sm:pb-28 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/35 bg-gradient-to-br from-[var(--zivia-warm-white)] via-white to-amber-50/50 px-7 py-14 shadow-[var(--zivia-shadow-gold)] sm:rounded-[2.25rem] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div
              className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gradient-to-l from-amber-200/25 to-transparent blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-amber-100/30 blur-2xl"
              aria-hidden
            />
            <div className="relative max-w-2xl">
              <p className="zivia-section-eyebrow text-amber-900/50">
                Satıcılar üçün
              </p>
              <h2 className="zivia-section-title mt-5">
                Zivia vitrinində yerinizi ayırdın
              </h2>
              <p className="zivia-section-desc max-w-lg">
                Sosial şəbəkədə topladığınız auditoriyanı təmiz, premium
                interfeysə daşıyın. Məhsul siyahısı, birbaşa WhatsApp əlaqəsi və
                satıcı hekayəniz bir yerdə.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="zivia-btn-primary rounded-2xl px-6">
                  Məhsullara bax
                </Link>

                <Link
                  href="/register"
                  className="zivia-btn-secondary rounded-2xl px-6 text-amber-800"
                >
                  Satıcı kimi qoşul
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
