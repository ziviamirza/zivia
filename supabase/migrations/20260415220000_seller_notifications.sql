-- Satıcı bildirişləri (məhsul, sistem; alıcı üçün tip saxlanılır)

CREATE TABLE IF NOT EXISTS public.seller_notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system'
    CHECK (type IN ('product', 'buyer', 'system', 'promo')),
  title text NOT NULL,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seller_notifications_user_created_desc
  ON public.seller_notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS seller_notifications_user_unread
  ON public.seller_notifications (user_id)
  WHERE read_at IS NULL;

ALTER TABLE public.seller_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seller selects own notifications" ON public.seller_notifications;
DROP POLICY IF EXISTS "Seller updates own notifications" ON public.seller_notifications;

CREATE POLICY "Seller selects own notifications"
ON public.seller_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Seller updates own notifications"
ON public.seller_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Triqerlər service rolundan deyil, SECURITY DEFINER funksiya ilə yazılır

CREATE OR REPLACE FUNCTION public.notify_seller_new_product()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT s.user_id INTO owner_id
  FROM public.sellers s
  WHERE s.id = NEW.seller_id
  LIMIT 1;

  IF owner_id IS NOT NULL THEN
    INSERT INTO public.seller_notifications (user_id, type, title, body, href)
    VALUES (
      owner_id,
      'product',
      'Yeni məhsul dərc olundu',
      COALESCE(NEW.title, 'Məhsul'),
      '/products/' || COALESCE(
        NULLIF(trim(COALESCE(NEW.slug::text, '')), ''),
        NEW.id::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seller_notify_new_product ON public.products;
CREATE TRIGGER trg_seller_notify_new_product
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.notify_seller_new_product();

COMMENT ON TABLE public.seller_notifications IS 'Satıcıya məhsul və digər hadisələr üzrə bildirişlər';

GRANT SELECT, UPDATE ON public.seller_notifications TO authenticated;
