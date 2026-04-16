-- Analitika: service role olmadan anon/authenticated RPC ilə yazılsın

CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_event text,
  p_product_slug text DEFAULT NULL,
  p_seller_slug text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id bigint;
  v_product_id bigint;
  v_slug text;
  v_sslug text;
BEGIN
  IF p_event IS NULL OR p_event NOT IN (
    'product_view',
    'whatsapp_click',
    'seller_profile_view'
  ) THEN
    RETURN;
  END IF;

  IF p_event = 'seller_profile_view' THEN
    v_sslug := nullif(trim(coalesce(p_seller_slug, '')), '');
    IF v_sslug IS NULL THEN
      RETURN;
    END IF;
    SELECT id INTO v_seller_id FROM public.sellers WHERE slug = v_sslug LIMIT 1;
    IF v_seller_id IS NULL THEN
      RETURN;
    END IF;
    INSERT INTO public.seller_analytics_events (seller_id, product_id, event_type)
    VALUES (v_seller_id, NULL, p_event);
    RETURN;
  END IF;

  v_slug := nullif(trim(coalesce(p_product_slug, '')), '');
  IF v_slug IS NULL THEN
    RETURN;
  END IF;

  SELECT p.id, p.seller_id
  INTO v_product_id, v_seller_id
  FROM public.products p
  WHERE p.slug = v_slug
  LIMIT 1;

  IF v_product_id IS NULL OR v_seller_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.seller_analytics_events (seller_id, product_id, event_type)
  VALUES (v_seller_id, v_product_id, p_event);
END;
$$;

REVOKE ALL ON FUNCTION public.track_analytics_event(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_analytics_event(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.track_analytics_event(text, text, text) TO authenticated;

COMMENT ON FUNCTION public.track_analytics_event IS 'Vitrin/məhsul baxışı və WhatsApp klik — API route bu funksiyanı çağırır';
