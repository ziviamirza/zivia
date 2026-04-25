type Entry = {
  count: number;
  firstAt: number;
  lockedUntil?: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const LOCK_MS = 15 * 60 * 1000;

const attempts = new Map<string, Entry>();

function nowMs() {
  return Date.now();
}

function norm(v: string) {
  return v.trim().toLowerCase();
}

function key(ip: string, email: string) {
  return `${norm(ip)}|${norm(email)}`;
}

function readEntry(k: string) {
  const now = nowMs();
  const cur = attempts.get(k);
  if (!cur) return null;

  if (cur.lockedUntil && cur.lockedUntil > now) return cur;

  if (now - cur.firstAt > WINDOW_MS) {
    attempts.delete(k);
    return null;
  }

  if (cur.lockedUntil && cur.lockedUntil <= now) {
    attempts.delete(k);
    return null;
  }

  return cur;
}

export function getClientIp(req: Request): string {
  const h = req.headers;
  const fromCf = h.get("cf-connecting-ip");
  if (fromCf) return fromCf;
  const fromXff = h.get("x-forwarded-for");
  if (fromXff) return fromXff.split(",")[0]?.trim() || "unknown";
  const fromReal = h.get("x-real-ip");
  return fromReal || "unknown";
}

export function getLoginRateLimitState(ip: string, email: string): { blocked: boolean; retryAfterSec: number } {
  const k = key(ip, email);
  const entry = readEntry(k);
  if (!entry?.lockedUntil) return { blocked: false, retryAfterSec: 0 };
  const retryAfterSec = Math.max(1, Math.ceil((entry.lockedUntil - nowMs()) / 1000));
  return { blocked: true, retryAfterSec };
}

export function noteLoginFailure(ip: string, email: string) {
  const k = key(ip, email);
  const now = nowMs();
  const current = readEntry(k);
  if (!current) {
    attempts.set(k, { count: 1, firstAt: now });
    return;
  }

  const nextCount = current.count + 1;
  if (nextCount >= MAX_ATTEMPTS) {
    attempts.set(k, { count: nextCount, firstAt: current.firstAt, lockedUntil: now + LOCK_MS });
    return;
  }

  attempts.set(k, { count: nextCount, firstAt: current.firstAt });
}

export function clearLoginFailures(ip: string, email: string) {
  attempts.delete(key(ip, email));
}
