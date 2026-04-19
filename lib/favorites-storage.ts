/** Brauzerdə saxlanılan məhsul sluqları (bəyənilənlər). */
export const FAVORITES_STORAGE_KEY = "zivia_favorites_v1";
const FAVORITES_EVENT = "zivia-favorites";

function normalizeSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const s = x.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function readFavoriteSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return normalizeSlugs(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function writeFavoriteSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeSlugs(slugs);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function isFavoriteSlug(slug: string): boolean {
  const s = slug.trim();
  if (!s) return false;
  return readFavoriteSlugs().includes(s);
}

export function toggleFavoriteSlug(slug: string): boolean {
  const s = slug.trim();
  if (!s) return false;
  const cur = readFavoriteSlugs();
  const has = cur.includes(s);
  if (has) writeFavoriteSlugs(cur.filter((x) => x !== s));
  else writeFavoriteSlugs([...cur, s]);
  return !has;
}

export function favoriteCount(): number {
  return readFavoriteSlugs().length;
}

export function subscribeFavorites(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onEv = () => callback();
  const onStorage = (e: StorageEvent) => {
    if (e.key === FAVORITES_STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener(FAVORITES_EVENT, onEv);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, onEv);
    window.removeEventListener("storage", onStorage);
  };
}
