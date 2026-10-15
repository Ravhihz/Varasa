-- Only expose articles when their publication calendar date has arrived in WIB.
-- Comparing dates (rather than exact timestamps) keeps the date-only admin field
-- consistent with Asia/Jakarta, including existing rows stored at 00:00 UTC.
DROP POLICY IF EXISTS "articles_public_select" ON public.articles;
CREATE POLICY "articles_public_select"
  ON public.articles FOR SELECT
  TO anon
  USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND (published_at AT TIME ZONE 'Asia/Jakarta')::date
      <= (now() AT TIME ZONE 'Asia/Jakarta')::date
  );

DROP POLICY IF EXISTS "articles_authenticated_select" ON public.articles;
CREATE POLICY "articles_authenticated_select"
  ON public.articles FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR (
      status = 'published'
      AND published_at IS NOT NULL
      AND (published_at AT TIME ZONE 'Asia/Jakarta')::date
        <= (now() AT TIME ZONE 'Asia/Jakarta')::date
    )
  );

COMMENT ON COLUMN public.articles.published_at IS
  'Publication calendar date in Asia/Jakarta. Public queries expose an article starting on this date.';
