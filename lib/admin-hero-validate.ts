const MAX_URL = 2048;
const MAX_ALT = 240;

export function normalizeLinkUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  if (!t) return null;
  if (t.startsWith("/")) {
    if (t.startsWith("//")) return null;
    return t.length > 500 ? t.slice(0, 500) : t;
  }
  if (/^https:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      if (u.protocol !== "https:") return null;
      return u.href.length > 800 ? u.href.slice(0, 800) : u.href;
    } catch {
      return null;
    }
  }
  return null;
}

export function isAllowedHeroImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (t.length < 12 || t.length > MAX_URL) return false;
  if (!/^https:\/\//i.test(t)) return false;
  if (/[\s<>"']/.test(t)) return false;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:") return false;
    if (u.hostname === "images.unsplash.com") return true;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (base) {
      const host = new URL(base).hostname;
      if (
        u.hostname === host &&
        u.pathname.includes("/storage/v1/object/public/hero-images/")
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function normalizeAlt(raw: string | undefined): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return "Hero şəkli";
  return t.length > MAX_ALT ? t.slice(0, MAX_ALT) : t;
}
