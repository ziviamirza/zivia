-- sellers üçün RLS: əksər hallarda "Satıcı tapılmadı" məhz SELECT bloklandığı üçün olur.
-- Supabase Dashboard → SQL Editor → Run (layihədə bir dəfə kifayətdir; təkrar təhlükəsizdir).

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users insert own seller" ON public.sellers;
DROP POLICY IF EXISTS "Users update own seller" ON public.sellers;

-- Vitrin / satıcı səhifələri anon açarı ilə oxunur (lib/supabase.ts)
CREATE POLICY "Anyone can view sellers"
ON public.sellers
FOR SELECT
TO anon, authenticated
USING (true);

-- Qeydiyyat və ya client insert yalnız öz user_id üçün
CREATE POLICY "Users insert own seller"
ON public.sellers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own seller"
ON public.sellers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
