-- Satıcı üçün sadə hadisə jurnalı (API xidmət açarı ilə yazılır)

CREATE TABLE IF NOT EXISTS public.seller_analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id bigint NOT NULL REFERENCES public.sellers (id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products (id) ON DELETE SET NULL,
  event_type text NOT NULL
    CHECK (event_type IN ('product_view', 'whatsapp_click', 'seller_profile_view')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seller_analytics_events_seller_created
  ON public.seller_analytics_events (seller_id, created_at DESC);

ALTER TABLE public.seller_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seller reads own analytics events" ON public.seller_analytics_events;

CREATE POLICY "Seller reads own analytics events"
ON public.seller_analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = seller_id
      AND s.user_id = auth.uid()
  )
);

COMMENT ON TABLE public.seller_analytics_events IS 'Vitrin/məhsul baxışı və WhatsApp klikləri (server API ilə)';
