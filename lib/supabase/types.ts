/**
 * Database type definitions for Varasa.
 *
 * These types mirror the Supabase schema defined in supabase/migrations/.
 * For full generated types, run:
 *   npx supabase gen types typescript --project-id <project-ref> > lib/supabase/types.ts
 *
 * Until then, these manual types provide type safety throughout the app.
 */

export type ArticleStatus = 'draft' | 'published'

export interface Database {
  public: {
    Tables: {
      authors: {
        Row: Author
        Insert: AuthorInsert
        Update: AuthorUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      articles: {
        Row: Article
        Insert: ArticleInsert
        Update: ArticleUpdate
      }
      article_categories: {
        Row: ArticleCategory
        Insert: ArticleCategoryInsert
        Update: never
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

export interface Author {
  id: string
  name: string
  slug: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export type AuthorInsert = Omit<Author, 'id' | 'created_at'>
export type AuthorUpdate = Partial<AuthorInsert>

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'>
export type CategoryUpdate = Partial<CategoryInsert>

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export interface Article {
  id: string
  author_id: string
  title: string
  slug: string
  excerpt: string | null
  content_json: TiptapDocument | null
  cover_image: string | null
  status: ArticleStatus
  seo_title: string | null
  meta_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>
export type ArticleUpdate = Partial<Omit<ArticleInsert, 'author_id'>>

// Article with joined relations
export interface ArticleWithRelations extends Article {
  author: Author | null
  categories: Category[]
}

// ---------------------------------------------------------------------------
// Article Categories
// ---------------------------------------------------------------------------

export interface ArticleCategory {
  article_id: string
  category_id: string
}

export type ArticleCategoryInsert = ArticleCategory

// ---------------------------------------------------------------------------
// Tiptap JSON document types
// ---------------------------------------------------------------------------

export interface TiptapDocument {
  type: 'doc'
  content: TiptapNode[]
}

export type TiptapNodeType =
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'blockquote'
  | 'horizontalRule'
  | 'image'
  | 'text'

export type TiptapMarkType = 'bold' | 'italic' | 'link'

export interface TiptapNode {
  type: TiptapNodeType
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

export interface TiptapMark {
  type: TiptapMarkType
  attrs?: Record<string, unknown>
}
