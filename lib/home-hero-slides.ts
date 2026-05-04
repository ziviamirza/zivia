import { supabase } from "@/lib/supabase";

export type HomeHeroSlidePublic = {
  id: number;
  sort_order: number;
  image_url: string;
  alt_text: string;
  link_url: string | null;
};

/** Anon RLS: yalnız aktiv slaydlar. Cədvəl yoxdursa boş massiv. */
export async function getHomeHeroSlidesPublic(): Promise<HomeHeroSlidePublic[]> {
  const { data, error } = await supabase
    .from("home_hero_slides")
    .select("id, sort_order, image_url, alt_text, link_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.warn("home_hero_slides oxunmadı:", error.message);
    return [];
  }
  return (data ?? []) as HomeHeroSlidePublic[];
}
