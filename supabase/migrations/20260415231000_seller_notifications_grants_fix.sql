-- Əvvəlki migrasiya artıq işlənibsə və GRANT əskikdirsə, bu faylı ayrıca işlədin.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'seller_notifications'
  ) THEN
    GRANT SELECT, UPDATE ON public.seller_notifications TO authenticated;
  END IF;
END $$;
