-- products: vitrin hamıya açıq; yazma yalnız öz satıcısı üçün (seller_id → sellers.user_id = auth.uid())
-- Supabase SQL Editor → Run

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Sellers insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers delete own products" ON public.products;

CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Sellers insert own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Sellers update own products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Sellers delete own products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
  )
);
