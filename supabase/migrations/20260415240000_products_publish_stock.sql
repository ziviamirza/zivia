-- Məhsul vitrin görünürlüyü + stok; ictimai oxuma yalnız yayımda və stokda

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 1;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_stock_quantity_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_stock_quantity_check CHECK (stock_quantity >= 0);

COMMENT ON COLUMN public.products.is_published IS 'false olanda vitrin siyahılarında görünmür (satıcı panelində görünür)';
COMMENT ON COLUMN public.products.stock_quantity IS '0 = stokda yoxdur; vitrində gizlədilir';

-- Köhnə ümumi SELECT siyasətini əvəz et

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

CREATE POLICY "Products anon read catalog"
ON public.products
FOR SELECT
TO anon
USING (is_published AND stock_quantity > 0);

CREATE POLICY "Products authenticated read catalog or own"
ON public.products
FOR SELECT
TO authenticated
USING (
  (is_published AND stock_quantity > 0)
  OR EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = products.seller_id
      AND s.user_id = auth.uid()
  )
);

-- Yalnız yayımda olanda bildiriş (INSERT triqeri)

CREATE OR REPLACE FUNCTION public.notify_seller_new_product()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  IF NOT NEW.is_published THEN
    RETURN NEW;
  END IF;

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
