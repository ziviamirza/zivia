import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPaths = [
    "",
    "/products",
    "/register",
    "/login",
    "/privacy",
    "/terms",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [{ data: products }, { data: sellers }] = await Promise.all([
      supabase.from("products").select("slug").not("slug", "is", null),
      supabase.from("sellers").select("slug").not("slug", "is", null),
    ]);

    const productEntries: MetadataRoute.Sitemap = (products ?? [])
      .filter((p): p is { slug: string } => Boolean(p?.slug))
      .map((p) => ({
        url: `${base}/products/${encodeURIComponent(p.slug)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    const sellerEntries: MetadataRoute.Sitemap = (sellers ?? [])
      .filter((s): s is { slug: string } => Boolean(s?.slug))
      .map((s) => ({
        url: `${base}/sellers/${encodeURIComponent(s.slug)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

    return [...staticEntries, ...productEntries, ...sellerEntries];
  } catch {
    // Sitemap should still render if DB query fails temporarily.
    return staticEntries;
  }
}
