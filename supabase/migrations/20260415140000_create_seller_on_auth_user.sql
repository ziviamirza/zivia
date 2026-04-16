-- Zivia: satıcı sətri auth qeydiyyatı ilə eyni vaxtda yaradılsın (kok həll).
-- Brauzerdə insert əvəzinə trigger: e-poçt təsdiqi aktiv olanda da işləyir (sessiya olmadan).
--
-- Tətbiq: Supabase Dashboard → SQL Editor → bu faylın məzmununu yapışdırıb Run.
-- Qeyd: signUp-da options.data.brand_name göndərilməlidir (app artıq göndərir).

-- Köhnə trigger/funksiya varsa sil
DROP TRIGGER IF EXISTS on_auth_user_created_seller ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_seller();
DROP FUNCTION IF EXISTS public.slugify_az(text);

-- Tətbiqdəki slugify ilə uyğunlaşdırılmış slug
CREATE OR REPLACE FUNCTION public.slugify_az(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  s text;
BEGIN
  s := lower(trim(coalesce(input, '')));
  s := replace(s, 'ə', 'e');
  s := replace(s, 'ü', 'u');
  s := replace(s, 'ö', 'o');
  s := replace(s, 'ğ', 'g');
  s := replace(s, 'ş', 's');
  s := replace(s, 'ç', 'c');
  s := replace(s, 'ı', 'i');
  s := regexp_replace(s, '\s+', '-', 'g');
  s := regexp_replace(s, '[^a-z0-9-]', '', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  s := trim(both '-' from s);
  IF s = '' THEN
    s := 'satici';
  END IF;
  RETURN s;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_seller()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brand text;
  base_slug text;
  final_slug text;
BEGIN
  brand := nullif(trim(coalesce(NEW.raw_user_meta_data->>'brand_name', '')), '');
  IF brand IS NULL THEN
    RETURN NEW;
  END IF;

  base_slug := public.slugify_az(brand);
  final_slug := base_slug || '-' || substr(replace(NEW.id::text, '-', ''), 1, 12);

  INSERT INTO public.sellers (
    user_id,
    name,
    slug,
    description,
    whatsapp,
    instagram,
    tiktok,
    avatar
  )
  VALUES (
    NEW.id,
    brand,
    final_slug,
    'Yeni satıcı profili',
    '',
    '',
    '',
    ''
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_seller
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_seller();

-- Backfill: bu migration-dan əvvəl yaradılmış user-lar üçün sellers sətri yarat.
-- Təkrar işləndikdə zərər verməmək üçün conflict-lərdə susur.
INSERT INTO public.sellers (
  user_id,
  name,
  slug,
  description,
  whatsapp,
  instagram,
  tiktok,
  avatar
)
SELECT
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'brand_name'), ''),
    split_part(u.email, '@', 1)
  ) AS name,
  public.slugify_az(
    coalesce(
      nullif(trim(u.raw_user_meta_data->>'brand_name'), ''),
      split_part(u.email, '@', 1)
    )
  ) || '-' || substr(replace(u.id::text, '-', ''), 1, 12) AS slug,
  'Yeni satıcı profili',
  '',
  '',
  '',
  ''
FROM auth.users u
LEFT JOIN public.sellers s ON s.user_id = u.id
WHERE s.user_id IS NULL
ON CONFLICT (slug) DO NOTHING;
