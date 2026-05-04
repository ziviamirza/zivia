import AdminHeroSlidesForm from "@/components/admin/AdminHeroSlidesForm";
import { getSiteUrl } from "@/lib/site";
import { createServiceSupabaseAdmin } from "@/lib/supabase-service-admin";

export const metadata = {
  title: "Hero karuseli",
  description: "Ana səhifə banner şəkilləri və kampaniya keçidləri.",
};

export default async function AdminHeroPage() {
  const svc = createServiceSupabaseAdmin();
  let initialSlides: Array<{
    id: number;
    sort_order: number;
    image_url: string;
    alt_text: string;
    link_url: string | null;
    is_active: boolean;
  }> = [];

  if (svc) {
    const { data, error } = await svc
      .from("home_hero_slides")
      .select("id, sort_order, image_url, alt_text, link_url, is_active")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });
    if (!error && Array.isArray(data)) {
      initialSlides = data as typeof initialSlides;
    }
  }

  const siteUrl = getSiteUrl();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">Hero karuseli</h1>
        <p className="mt-1 text-sm text-stone-600">
          Ana səhifə üst bannerində görünən şəkillər və hər slayd üçün &quot;Kəşf et&quot; keçidi. Dəyişikliklər yayımdan
          sonra bir neçə saniyə ərzində tətbiq olunur.
        </p>
      </div>

      <AdminHeroSlidesForm
        initialSlides={initialSlides}
        siteUrl={siteUrl}
        serviceConfigured={Boolean(svc)}
      />
    </div>
  );
}
