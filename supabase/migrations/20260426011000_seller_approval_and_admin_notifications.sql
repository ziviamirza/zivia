-- Seller approval flow + admin notifications

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS reviewed_by text;

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS review_note text;

ALTER TABLE public.sellers
  DROP CONSTRAINT IF EXISTS sellers_approval_status_check;

ALTER TABLE public.sellers
  ADD CONSTRAINT sellers_approval_status_check
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS sellers_approval_status_created_idx
  ON public.sellers (approval_status, id DESC);

-- Mövcud satıcılar launch zamanı işləməyə davam etsin
UPDATE public.sellers
SET approval_status = 'approved'
WHERE approval_status = 'pending';

-- Yeni satıcılar default pending olsun
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

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id bigserial PRIMARY KEY,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  href text,
  seller_id bigint,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications
  ADD CONSTRAINT admin_notifications_kind_seller_unique
  UNIQUE (kind, seller_id);

CREATE INDEX IF NOT EXISTS admin_notifications_unread_created_idx
  ON public.admin_notifications (is_read, created_at DESC);

CREATE OR REPLACE FUNCTION public.notify_admin_new_seller()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.approval_status <> 'pending' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.admin_notifications (kind, title, body, href, seller_id)
  VALUES (
    'seller_application',
    'Yeni satıcı müraciəti',
    COALESCE(NEW.name, 'Adsız satıcı') || ' yoxlanış gözləyir.',
    '/admin/sellers',
    NEW.id
  )
  ON CONFLICT (kind, seller_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_seller ON public.sellers;
CREATE TRIGGER trg_notify_admin_new_seller
AFTER INSERT ON public.sellers
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_seller();

-- Public vitrin yalnız approved satıcıları göstərsin
DROP POLICY IF EXISTS "Anyone can view sellers" ON public.sellers;
CREATE POLICY "Anyone can view approved sellers"
ON public.sellers
FOR SELECT
TO anon, authenticated
USING (
  approval_status = 'approved'
  OR auth.uid() = user_id
);

-- Məhsul yazma yalnız approved satıcılara
DROP POLICY IF EXISTS "Sellers insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers delete own products" ON public.products;

CREATE POLICY "Sellers insert own approved products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
      AND s.approval_status = 'approved'
  )
);

CREATE POLICY "Sellers update own approved products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
      AND s.approval_status = 'approved'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
      AND s.approval_status = 'approved'
  )
);

CREATE POLICY "Sellers delete own approved products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
      AND s.approval_status = 'approved'
  )
);
