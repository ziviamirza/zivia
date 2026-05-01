-- E-poçt təsdiqlənəndə satıcı sətiri hələ yoxdursa yaradılır (INSERT trigger
-- qaçıbsa və ya metadata gec düşübsə). Supabase SQL Editor-də bir dəfə işlədin.

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmed_seller()
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
  IF EXISTS (SELECT 1 FROM public.sellers s WHERE s.user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

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
    avatar,
    approval_status
  )
  VALUES (
    NEW.id,
    brand,
    final_slug,
    'Yeni satıcı profili',
    '',
    '',
    '',
    '',
    'pending'
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_seller ON auth.users;

CREATE TRIGGER on_auth_user_email_confirmed_seller
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_auth_user_email_confirmed_seller();
