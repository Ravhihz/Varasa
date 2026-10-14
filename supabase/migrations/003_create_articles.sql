-- =============================================================================
-- Migration 003: Create articles table + updated_at trigger
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        uuid NOT NULL REFERENCES public.authors (id) ON DELETE RESTRICT,
  title            text NOT NULL,
  slug             text NOT NULL,
  excerpt          text,
  content_json     jsonb,
  cover_image      text,
  status           text NOT NULL DEFAULT 'draft',
  seo_title        text,
  meta_description text,
  -- published_at is editorial metadata; set when first published (if null),
  -- preserved on subsequent edits. No scheduled publishing in MVP.
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT articles_slug_unique UNIQUE (slug),
  CONSTRAINT articles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT articles_status_values CHECK (status IN ('draft', 'published'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_articles_slug
  ON public.articles (slug);

CREATE INDEX IF NOT EXISTS idx_articles_status_published_at
  ON public.articles (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_author_id
  ON public.articles (author_id);

-- Trigger: auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER articles_set_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.articles IS 'Core content table. content_json stores Tiptap JSON document.';
COMMENT ON COLUMN public.articles.status IS 'draft | published. Drafts are never visible publicly.';
COMMENT ON COLUMN public.articles.published_at IS 'Editorial metadata. Set automatically on first publish if null. Preserved on edits. No scheduled publishing.';
COMMENT ON COLUMN public.articles.content_json IS 'Tiptap v3 JSON document. Validated against approved node/mark schema before save.';
