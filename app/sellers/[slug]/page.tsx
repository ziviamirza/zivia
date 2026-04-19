import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrackSellerProfileView from "@/components/analytics/TrackSellerProfileView";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import { primaryProductImageUrl } from "@/lib/product-images";
import { buildSellerProfileJsonLd } from "@/lib/jsonld";
import { initialsFromName, normalizeSocialUrl } from "@/lib/social-links";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: seller } = await supabase
    .from("sellers")
    .select("name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!seller?.name) return { title: "Satıcı tapılmadı" };

  const desc =
    typeof seller.description === "string" && seller.description.trim()
      ? seller.description.trim().slice(0, 155)
      : `${seller.name} — Zivia-da zərgərlik və məhsul vitrini.`;

  return {
    title: seller.name,
    description: desc,
    openGraph: {
      title: `${seller.name} | Zivia`,
      description: desc,
      type: "profile",
    },
  };
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: seller, error: sellerError } = await supabase
    .from("sellers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (sellerError || !seller) {
    return (
      <main className="px-3 py-8">
        <div className="app-surface p-6 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Satıcı tapılmadı</h1>
          <p className="mt-3 text-sm text-neutral-600">Bu vitrin mövcud deyil və ya keçid dəyişib.</p>
          <Link href="/products" className="app-btn-primary mt-6">
            Məhsullara keç
          </Link>
        </div>
      </main>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", seller.id)
    .order("id", { ascending: false });

  const list = products ?? [];
  const count = list.length;
  const wa = seller.whatsapp
    ? `https://wa.me/${String(seller.whatsapp).replace(/\D/g, "")}`
    : null;
  const ig = normalizeSocialUrl(seller.instagram, "instagram");
  const tt = normalizeSocialUrl(seller.tiktok, "tiktok");
  const initials = initialsFromName(String(seller.name ?? "?"));

  const base = getSiteUrl();
  const sellerPageUrl = `${base}/sellers/${encodeURIComponent(slug)}`;
  const sameAs = [wa, ig, tt].filter(
    (u): u is string => typeof u === "string" && /^https?:\/\//i.test(u),
  );
  const sellerAvatarAbs = toAbsoluteUrl(
    base,
    typeof seller.avatar === "string" ? seller.avatar : null,
  );
  const sellerJsonLd = buildSellerProfileJsonLd({
    pageUrl: sellerPageUrl,
    name: String(seller.name ?? "Satıcı"),
    description: typeof seller.description === "string" ? seller.description : null,
    imageUrl: sellerAvatarAbs ?? undefined,
    sameAs,
  });

  return (
    <main className="space-y-4 px-3 pt-3 text-neutral-900 md:px-4">
      <JsonLd id="zivia-seller-jsonld" data={sellerJsonLd} />
      <TrackSellerProfileView sellerSlug={slug} />

      <section className="app-surface overflow-hidden p-4">
        <div className="flex items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-stone-100">
            {seller.avatar ? (
              <Image
                src={seller.avatar}
                alt={String(seller.name)}
                fill
                className="object-cover"
                sizes="64px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold tracking-tight text-amber-900/70">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b6b2c]">
              Satıcı vitrini
            </p>
            <h1 className="line-clamp-1 font-display text-2xl text-neutral-900">{seller.name}</h1>
            <p className="mt-1 text-xs text-stone-500">{count} məhsul</p>
          </div>
        </div>

        {seller.description ? (
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">{seller.description}</p>
        ) : (
          <p className="mt-3 text-sm italic text-neutral-400">Qısa təsvir tezliklə əlavə olunacaq.</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="app-btn-primary rounded-lg px-3 py-2 text-xs"
            >
              WhatsApp
            </a>
          ) : null}
          {ig ? (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              className="zivia-btn-secondary rounded-lg px-3 py-2 text-xs"
            >
              Instagram
            </a>
          ) : null}
          {tt ? (
            <a
              href={tt}
              target="_blank"
              rel="noopener noreferrer"
              className="zivia-btn-secondary rounded-lg px-3 py-2 text-xs"
            >
              TikTok
            </a>
          ) : null}
        </div>
      </section>

      <section className="pb-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-neutral-900">Məhsullar</h2>
          <Link href="/products" className="text-xs text-[#8b6b2c]">
            Hamısı
          </Link>
        </div>
        {count === 0 ? (
          <div className="app-surface p-5 text-center">
            <p className="text-sm font-semibold text-neutral-800">Hələ məhsul yoxdur</p>
            <Link href="/products" className="app-btn-primary mt-4">
              Məhsullara bax
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                category={product.category}
                price={Number(product.price)}
                slug={product.slug}
                imageUrl={primaryProductImageUrl(
                  product as { image?: string | null; images?: unknown },
                )}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
