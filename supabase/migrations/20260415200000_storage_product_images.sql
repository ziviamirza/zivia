-- Məhsul şəkilləri: public oxuma, yükləmə yalnız öz qovluğunda (auth.uid() / fayl)
-- Supabase → SQL Editor → Run
-- Dashboard → Storage-da "product-images" qovluğu yaradılmayıbsa, bu skript bucket yaradır.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own product images" ON storage.objects;

CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Users upload own product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users update own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'product-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);

CREATE POLICY "Users delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND split_part(name, '/', 1) = auth.uid()::text
);
