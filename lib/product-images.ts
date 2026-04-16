/** Məhsul qalereyasında icazə verilən maksimum şəkil sayı. */
export const MAX_PRODUCT_GALLERY_IMAGES = 8;

export function parseImagesJson(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const x of raw) {
      if (typeof x === "string") {
        const t = x.trim();
        if (t) out.push(t);
      }
    }
    return dedupePreserveOrder(out);
  }
  return [];
}

function dedupePreserveOrder(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/** DB sətri: `images` jsonb + köhnə tək `image` sütunu. */
export function productRowImageUrls(row: {
  images?: unknown;
  image?: string | null;
}): string[] {
  const fromJson = parseImagesJson(row.images);
  if (fromJson.length > 0) return fromJson.slice(0, MAX_PRODUCT_GALLERY_IMAGES);
  const legacy = typeof row.image === "string" ? row.image.trim() : "";
  if (legacy) return [legacy];
  return [];
}

export function primaryProductImageUrl(row: {
  images?: unknown;
  image?: string | null;
}): string | null {
  const u = productRowImageUrls(row);
  return u[0] ?? null;
}
