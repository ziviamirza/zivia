/**
 * Unsplash URL-lərini birbaşa CDN-ə yönləndirir (Next `/_next/image` optimizatoru
 * olmadan). Dev (Turbopack) və bəzi mühitlərdə `/_next/image` 404 verəndə həll edir.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (typeof src !== "string") return String(src);

  if (!/^https:\/\/images\.unsplash\.com\//i.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 80));
    return url.href;
  } catch {
    return src;
  }
}
