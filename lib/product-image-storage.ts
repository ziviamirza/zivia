export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Məhsul cədvəlində saxlanan public URL-dən storage obyekt yolunu çıxarır
 * (məs: .../object/public/product-images/<userId>/fayl.jpg → <userId>/fayl.jpg).
 */
export function productImageObjectPathsForUser(
  imageUrls: string[],
  userId: string,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of imageUrls) {
    const p = productImageObjectPathFromPublicUrl(url);
    if (p && p.startsWith(`${userId}/`) && !seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

export function productImageObjectPathFromPublicUrl(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const u = imageUrl.trim();
  const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = u.indexOf(marker);
  if (idx === -1) return null;
  const raw = u.slice(idx + marker.length);
  const noQuery = (raw.split("?")[0] ?? "").trim();
  if (!noQuery) return null;
  try {
    const path = decodeURIComponent(noQuery);
    if (!path || path.includes("..") || path.startsWith("/")) return null;
    return path;
  } catch {
    return null;
  }
}
