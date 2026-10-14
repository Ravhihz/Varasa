-- =============================================================================
-- Migration 002: Create categories table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT categories_slug_unique UNIQUE (slug),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Index for slug lookups (public category pages)
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

COMMENT ON TABLE public.categories IS 'Flat category list. Tags and nested categories are out of scope for MVP.';
COMMENT ON COLUMN public.categories.slug IS 'URL-safe slug used in /categories/[slug] route.';
