type ProductJsonLdInput = {
  base: string;
  productPageUrl: string;
  name: string;
  description?: string | null;
  imageUrls: string[];
  price: number;
  currency: "AZN";
  sku: string;
  category?: string | null;
  sellerName?: string | null;
  sellerPageUrl?: string | null;
  stockQuantity?: number | null;
};

export function buildProductDetailJsonLd(input: ProductJsonLdInput): Record<string, unknown> {
  const availability =
    typeof input.stockQuantity === "number" && input.stockQuantity <= 0
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const brand =
    input.sellerName?.trim() ?
      {
        "@type": "Brand",
        name: input.sellerName.trim(),
        ...(input.sellerPageUrl ? { url: input.sellerPageUrl } : {}),
      }
    : undefined;

  const desc = typeof input.description === "string" ? input.description.trim() : "";

  const product: Record<string, unknown> = {
    "@type": "Product",
    name: input.name,
    sku: input.sku,
    ...(desc ? { description: desc } : {}),
    ...(input.imageUrls.length ? { image: input.imageUrls } : {}),
    ...(input.category?.trim() ? { category: input.category.trim() } : {}),
    ...(brand ? { brand } : {}),
    offers: {
      "@type": "Offer",
      url: input.productPageUrl,
      priceCurrency: input.currency,
      price: Number.isFinite(input.price) ? String(input.price) : "0",
      availability,
    },
  };

  const home = `${input.base.replace(/\/$/, "")}/`;

  const breadcrumbs: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana səhifə", item: home },
      { "@type": "ListItem", position: 2, name: "Məhsullar", item: `${input.base}/products` },
      {
        "@type": "ListItem",
        position: 3,
        name: input.name,
        item: input.productPageUrl,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumbs, product],
  };
}

type SellerJsonLdInput = {
  pageUrl: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sameAs: string[];
};

export function buildSellerProfileJsonLd(input: SellerJsonLdInput): Record<string, unknown> {
  const entityId = `${input.pageUrl}#seller`;
  const desc = typeof input.description === "string" ? input.description.trim() : "";

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": entityId,
    name: input.name,
    url: input.pageUrl,
    ...(desc ? { description: desc } : {}),
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(input.sameAs.length ? { sameAs: input.sameAs } : {}),
  };

  const profilePage: Record<string, unknown> = {
    "@type": "ProfilePage",
    "@id": `${input.pageUrl}#profile`,
    url: input.pageUrl,
    name: input.name,
    mainEntity: { "@id": entityId },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [profilePage, person],
  };
}

export function buildSiteJsonLd(siteUrl: string): Record<string, unknown> {
  const base = siteUrl.replace(/\/$/, "");
  const orgId = `${base}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Zivia",
        url: base,
        description:
          "TikTok və Instagram zərgərlik satıcılarını bir araya gətirən premium marketplace.",
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "Zivia",
        url: base,
        publisher: { "@id": orgId },
        inLanguage: "az-AZ",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/products?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
