-- =============================================================================
-- Migration 001: Create authors table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.authors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL,
  bio         text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT authors_slug_unique UNIQUE (slug),
  CONSTRAINT authors_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Index for slug lookups (public author pages)
CREATE INDEX IF NOT EXISTS idx_authors_slug ON public.authors (slug);

-- Comment
COMMENT ON TABLE public.authors IS 'Single-author MVP. One row per author profile.';
COMMENT ON COLUMN public.authors.slug IS 'URL-safe slug used in /author/[slug] route.';
