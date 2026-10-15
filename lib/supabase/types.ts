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
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
        Relationships: []
      }
      articles: {
        Row: Article
        Insert: ArticleInsert
        Update: ArticleUpdate
        Relationships: [
          {
            foreignKeyName: 'articles_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'authors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'article_categories_article_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'article_categories'
            referencedColumns: ['article_id']
          },
        ]
      }
      article_categories: {
        Row: ArticleCategory
        Insert: ArticleCategoryInsert
        Update: never
        Relationships: [
          {
            foreignKeyName: 'article_categories_article_id_fkey'
            columns: ['article_id']
            isOneToOne: false
            referencedRelation: 'articles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'article_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Views: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

export type Author = {
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

export type Category = {
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

export type Article = {
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

export type ArticleCategory = {
  article_id: string
  category_id: string
}

export type ArticleCategoryInsert = ArticleCategory

// ---------------------------------------------------------------------------
// Tiptap JSON document types
// ---------------------------------------------------------------------------

export type TiptapDocument = {
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

export type TiptapNode = {
  type: TiptapNodeType
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

export type TiptapMark = {
  type: TiptapMarkType
  attrs?: Record<string, unknown>
}
