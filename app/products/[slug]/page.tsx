import Link from "next/link";
import { notFound } from "next/navigation";
import TrackProductView from "@/components/analytics/TrackProductView";
import TrackWhatsAppProductClick from "@/components/analytics/TrackWhatsAppProductClick";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductCard from "@/components/ProductCard";
import { formatAzn } from "@/lib/format";
import {
  primaryProductImageUrl,
  productRowImageUrls,
} from "@/lib/product-images";
import { supabase } from "@/lib/supabase";

type Props = { params: Promise<{ slug: string }> };

type SellerRow = {
  name?: string | null;
  slug?: string | null;
  avatar?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  tagline?: string | null;
  description?: string | null;
};

type ProductWithSeller = {
  id?: string | number;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  images?: unknown;
  price?: number | string | null;
  category?: string | null;
  sellers?: SellerRow | SellerRow[] | null;
};

function normalizeSeller(
  sellers: ProductWithSeller["sellers"],
): SellerRow | null {
  if (!sellers) return null;
  return Array.isArray(sellers) ? (sellers[0] ?? null) : sellers;
}

async function fetchProductBySlug(slug: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select("*, sellers(*)")
    .eq("slug", slug)
    .single();

  if (error || !product) return null;
  return product as ProductWithSeller;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Tapılmadı" };
  const title = product.title ?? product.name ?? "Məhsul";
  const desc = product.description ?? "";
  return {
    title,
    description: desc.slice(0, 155),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const trackSlug = typeof slug === "string" ? slug : "";

  const seller = normalizeSeller(product.sellers);
  const displayName = product.title ?? product.name ?? "Məhsul";
  const priceNum = Number(product.price ?? 0);
  const galleryUrls = productRowImageUrls(product);
  const wa = seller?.whatsapp
    ? `https://wa.me/${seller.whatsapp}?text=${encodeURIComponent(
        `Salam, Zivia-da "${displayName}" məhsulu ilə maraqlanıram.`,
      )}`
    : "#";

  const { data: relatedRows } = await supabase
    .from("products")
    .select("id, title, category, price, slug, image, images")
    .neq("slug", slug)
    .limit(4);

  const related =
    (relatedRows ?? []) as {
      id: string | number;
      title?: string | null;
      category?: string | null;
      price?: number | string | null;
      slug?: string | null;
      image?: string | null;
      images?: unknown;
    }[];

  return (
    <div className="space-y-4 px-3 pt-3 md:px-4">
      {trackSlug ? <TrackProductView productSlug={trackSlug} /> : null}
      <nav className="px-1 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          Ana səhifə
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/products" className="hover:text-stone-800">
          Məhsullar
        </Link>
      </nav>

      <ProductImageGallery urls={galleryUrls} alt={displayName} />

      <section className="app-surface p-4">
        {product.category ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b6b2c]">
            {product.category}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-2xl text-stone-900">{displayName}</h1>
        <p className="mt-2 text-xl font-semibold text-[#7a5b24]">{formatAzn(priceNum)}</p>
        <p className="mt-1 text-xs text-[#8b6b2c]">{"★".repeat(5)} 4.9</p>
        {product.description ? (
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{product.description}</p>
        ) : null}

        {seller ? (
          <div className="mt-4 rounded-xl border border-[#dfd1b8] bg-white p-3">
            <p className="text-xs text-stone-500">Satıcı</p>
            <p className="text-sm font-semibold text-stone-900">{seller.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {seller.slug ? (
                <Link
                  href={`/sellers/${seller.slug}`}
                  className="zivia-btn-secondary rounded-lg px-3 py-2 text-xs"
                >
                  Profil
                </Link>
              ) : null}
              {seller.instagram ? (
                <a
                  href={seller.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zivia-btn-secondary rounded-lg px-3 py-2 text-xs"
                >
                  Instagram
                </a>
              ) : null}
              {seller.tiktok ? (
                <a
                  href={seller.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zivia-btn-secondary rounded-lg px-3 py-2 text-xs"
                >
                  TikTok
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          {wa !== "#" && trackSlug ? (
            <TrackWhatsAppProductClick
              href={wa}
              productSlug={trackSlug}
              className="app-btn-primary w-full justify-center"
            >
              WhatsApp ilə yaz
            </TrackWhatsAppProductClick>
          ) : (
            <span className="inline-flex w-full justify-center rounded-xl bg-stone-200 px-4 py-2.5 text-sm font-medium text-stone-500">
              WhatsApp əlavə edilməyib
            </span>
          )}
        </div>
      </section>

      <section className="pb-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-stone-900">Oxşar məhsullar</h2>
          <Link href="/products" className="text-xs text-[#8b6b2c]">
            Hamısı
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {related.map((p) => (
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
      </section>
    </div>
  );
}
