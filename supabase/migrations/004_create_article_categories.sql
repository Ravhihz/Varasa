-- =============================================================================
-- Migration 004: Create article_categories junction table (many-to-many)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id  uuid NOT NULL REFERENCES public.articles   (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,

  CONSTRAINT article_categories_pkey PRIMARY KEY (article_id, category_id)
);

-- Index for reverse lookup: all articles in a category
CREATE INDEX IF NOT EXISTS idx_article_categories_category_id
  ON public.article_categories (category_id);

COMMENT ON TABLE public.article_categories IS 'Many-to-many join between articles and categories. Tags and nested categories are out of scope for MVP.';
