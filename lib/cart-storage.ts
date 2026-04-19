/** Brauzer səbəti: mövcud məhsul sluqları + miqdar. Server sessiyası yoxdur. */
export const CART_STORAGE_KEY = "zivia_cart_v1";

export type CartLine = {
  slug: string;
  qty: number;
};

const CART_EVENT = "zivia-cart";

function normalizeLines(draft: CartLine[]): CartLine[] {
  const map = new Map<string, number>();
  for (const { slug, qty } of draft) {
    const s = typeof slug === "string" ? slug.trim() : "";
    if (!s) continue;
    const q = Math.round(Number(qty));
    if (!Number.isFinite(q) || q <= 0) continue;
    const add = Math.min(99, q);
    map.set(s, Math.min(99, (map.get(s) ?? 0) + add));
  }
  return [...map.entries()].map(([slug, qty]) => ({ slug, qty }));
}

export function readCartLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const draft: CartLine[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const slug = (item as { slug?: unknown }).slug;
      const qty = (item as { qty?: unknown }).qty;
      if (typeof slug !== "string") continue;
      const q = Number(qty);
      if (!Number.isFinite(q)) continue;
      draft.push({ slug, qty: q });
    }
    return normalizeLines(draft);
  } catch {
    return [];
  }
}

export function writeCartLines(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeLines(lines);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(slug: string, qty = 1): void {
  const s = slug.trim();
  if (!s) return;
  const lines = readCartLines();
  const add = Math.min(99, Math.max(1, Math.round(qty)));
  const idx = lines.findIndex((l) => l.slug === s);
  if (idx === -1) {
    writeCartLines([...lines, { slug: s, qty: add }]);
    return;
  }
  const next = [...lines];
  next[idx] = { slug: s, qty: Math.min(99, next[idx].qty + add) };
  writeCartLines(next);
}

export function cartItemCount(): number {
  return readCartLines().reduce((sum, l) => sum + l.qty, 0);
}

export function subscribeCart(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => callback();
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener(CART_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CART_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
