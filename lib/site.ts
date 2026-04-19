/** Canonik sayt ünvanı: production-da NEXT_PUBLIC_SITE_URL (məs: https://zivia.az). */
export function getSiteUrl(): string {
  let fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    if (!/^https?:\/\//i.test(fromEnv)) {
      fromEnv = `https://${fromEnv}`;
    }
    return fromEnv.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Şəkil və ya nisbi yolu tam https URL-ə çevirir (OG, JSON-LD). */
export function toAbsoluteUrl(
  baseUrl: string,
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const base = baseUrl.replace(/\/$/, "");
  try {
    const path = t.startsWith("/") ? t : `/${t}`;
    return new URL(path, base).href;
  } catch {
    return undefined;
  }
}
