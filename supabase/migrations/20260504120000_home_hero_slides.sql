-- Ana səhifə hero karuseli: admin API (service role) ilə idarə, anon yalnız aktiv sətirləri oxuyur.
-- Storage: hero-images — public oxuma; yükləmə yalnız serverdə service key ilə.

CREATE TABLE IF NOT EXISTS public.home_hero_slides (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sort_order integer NOT NULL,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  link_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_hero_slides_sort_order_range CHECK (sort_order >= 1 AND sort_order <= 100)
);

CREATE INDEX IF NOT EXISTS home_hero_slides_list_idx ON public.home_hero_slides (is_active, sort_order, id);

ALTER TABLE public.home_hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active hero slides" ON public.home_hero_slides;
CREATE POLICY "Public read active hero slides"
ON public.home_hero_slides
FOR SELECT
TO anon, authenticated
USING (is_active = true);

COMMENT ON TABLE public.home_hero_slides IS 'Ana səhifə hero; yazma yalnız service role (admin API).';

GRANT SELECT ON public.home_hero_slides TO anon, authenticated;

INSERT INTO public.home_hero_slides (sort_order, image_url, alt_text, link_url, is_active)
SELECT * FROM (
  VALUES
    (1, 'https://images.unsplash.com/photo-1611652022419-a9419f74343d', 'Zinət boyunbağı', '/products', true),
    (2, 'https://images.unsplash.com/photo-1515562140567-58e285261111', 'Üzük kolleksiyası', '/products', true),
    (3, 'https://images.unsplash.com/photo-1617038220319-276d3cfab638', 'Boyunbağı detalı', '/products', true),
    (4, 'https://images.unsplash.com/photo-1598560917505-59a3ad559071', 'Üzük və zərgərlik', '/products', true),
    (5, 'https://images.unsplash.com/photo-1601821765780-754fa98637c1', 'Bilərzik', '/products', true)
) AS v(sort_order, image_url, alt_text, link_url, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.home_hero_slides LIMIT 1);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read hero images" ON storage.objects;
CREATE POLICY "Public read hero images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'hero-images');
