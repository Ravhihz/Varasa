-- =============================================================================
-- Migration 005: Row Level Security policies + Storage bucket
-- =============================================================================
-- Authorization model:
--   Admin = authenticated user with app_metadata->>'role' = 'admin'
--   Set via Supabase Dashboard: Authentication → Users → Edit user → app_metadata
--   DO NOT equate authentication with admin authorization.
-- =============================================================================

-- Helper function: check if current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

-- =============================================================================
-- authors
-- =============================================================================
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authors_public_select"
  ON public.authors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authors_admin_insert"
  ON public.authors FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "authors_admin_update"
  ON public.authors FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "authors_admin_delete"
  ON public.authors FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- categories
-- =============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- articles
-- =============================================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public: only published articles
CREATE POLICY "articles_public_select"
  ON public.articles FOR SELECT
  TO anon
  USING (status = 'published');

-- Authenticated non-admin: also only published articles
CREATE POLICY "articles_authenticated_select"
  ON public.articles FOR SELECT
  TO authenticated
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "articles_admin_insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "articles_admin_update"
  ON public.articles FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "articles_admin_delete"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- article_categories
-- =============================================================================
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "article_categories_public_select"
  ON public.article_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "article_categories_admin_insert"
  ON public.article_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "article_categories_admin_delete"
  ON public.article_categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- Storage: varasa-media bucket
-- =============================================================================
-- Run these in Supabase Dashboard → Storage → New bucket:
--   Name: varasa-media
--   Public: true (allows public read of uploaded files)
--
-- Then apply these storage policies via Dashboard → Storage → Policies:
--
-- Policy 1 — Public read (anon + authenticated)
-- Bucket: varasa-media
-- Operation: SELECT
-- Definition: true
--
-- Policy 2 — Admin upload only
-- Bucket: varasa-media
-- Operation: INSERT
-- Definition: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
--
-- Policy 3 — Admin update/delete only
-- Bucket: varasa-media
-- Operations: UPDATE, DELETE
-- Definition: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
--
-- NOTE: Storage bucket policies cannot be created via SQL migration in Supabase.
--       They must be configured via the Dashboard or Supabase Management API.
--       See: https://supabase.com/docs/guides/storage/access-control
-- =============================================================================
