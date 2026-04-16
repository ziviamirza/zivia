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
