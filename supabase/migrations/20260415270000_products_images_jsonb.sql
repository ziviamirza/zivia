-- Məhsul üçün çoxlu şəkil URL-ləri (jsonb massiv); `image` birinci şəkil (köhnə kod üçün).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.products p
SET images = jsonb_build_array(trim(p.image::text))
WHERE p.image IS NOT NULL
  AND trim(p.image::text) <> ''
  AND jsonb_array_length(COALESCE(p.images, '[]'::jsonb)) = 0;

UPDATE public.products p
SET image = trim((p.images->>0)::text)
WHERE jsonb_array_length(COALESCE(p.images, '[]'::jsonb)) > 0
  AND (p.image IS NULL OR trim(p.image::text) = '');

COMMENT ON COLUMN public.products.images IS 'Məhsul şəkillərinin public URL siyahısı (sıra ilə); image sütunu vitrin üçün birinci URL ilə sinxron saxlanıla bilər';
