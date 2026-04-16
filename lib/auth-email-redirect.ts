import { getSiteUrl } from "@/lib/site";

/**
 * Auth e-poçtundakı keçid üçün tam URL.
 * Production-da `NEXT_PUBLIC_SITE_URL=https://zivia.az` təyin edin ki, linklər həmişə bu domenə getsin.
 */
export function getAuthEmailRedirectWithNext(nextPath: string): string {
  const base = getSiteUrl();
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
