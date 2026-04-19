/**
 * Sadə in-memory rate limit (instance başına). Serverless-da tam dəqiq deyil,
 * amma tək instansda spamı kəskin azaldır.
 */
const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 120;

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

function pruneExpired(now: number) {
  if (store.size < 3000) return;
  for (const [key, b] of store) {
    if (now >= b.resetAt) store.delete(key);
  }
}

export function clientKeyFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** true = icazə ver, false = limit aşılıb */
export function allowAnalyticsEvent(clientKey: string): boolean {
  const now = Date.now();
  const bucket = store.get(clientKey);

  if (!bucket || now >= bucket.resetAt) {
    store.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    pruneExpired(now);
    return true;
  }

  if (bucket.count >= MAX_EVENTS_PER_WINDOW) {
    return false;
  }

  bucket.count += 1;
  return true;
}
