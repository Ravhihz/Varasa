import { createClient } from '@/lib/supabase/server'
import type { Article, ArticleCategory, ArticleWithRelations, Author, Category } from '@/lib/supabase/types'

const ARTICLE_FIELDS = 'id, author_id, title, slug, excerpt, content_json, cover_image, status, seo_title, meta_description, published_at, created_at, updated_at'

/** Publication dates are editorial calendar dates in Indonesia (WIB). */
function getPublicationCutoff() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  const todayInJakarta = `${part('year')}-${part('month')}-${part('day')}`
  return new Date(`${todayInJakarta}T23:59:59.999+07:00`).toISOString()
}

type ArticleOptions = {
  limit?: number
  offset?: number
  categoryId?: string
  authorId?: string
  excludeId?: string
}

/** All public article queries share this status filter so drafts stay private. */
export async function getPublishedArticles(options: ArticleOptions = {}): Promise<ArticleWithRelations[]> {
  const supabase = await createClient()
  let categoryArticleIds: string[] | undefined
  if (options.categoryId) {
    const { data: links, error: linksError } = await supabase
      .from('article_categories')
      .select('article_id')
      .eq('category_id', options.categoryId)
    if (linksError || !links?.length) return []
    categoryArticleIds = [...new Set((links as ArticleCategory[]).map((link) => link.article_id))]
  }

  let query = supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('status', 'published')
    .lte('published_at', getPublicationCutoff())
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (options.authorId) query = query.eq('author_id', options.authorId)
  if (options.excludeId) query = query.neq('id', options.excludeId)
  if (categoryArticleIds) query = query.in('id', categoryArticleIds)
  if (options.offset !== undefined || options.limit !== undefined) {
    const from = options.offset ?? 0
    query = query.range(from, from + (options.limit ?? 12) - 1)
  }

  const { data: rows, error } = await query
  if (error || !rows?.length) return []

  return attachRelations(rows as unknown as Article[])
}

export async function getPublishedArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', getPublicationCutoff())
    .maybeSingle()
  if (error || !data) return null
  const articleData = data as unknown as Article
  const [article] = await attachRelations([articleData])
  return article ?? null
}

/** Admin-only preview data. Protect the route with requireAdmin before calling. */
export async function getArticleForPreview(id: string): Promise<ArticleWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  const [article] = await attachRelations([data as Article])
  return article ?? null
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  return error ? [] : (data as Category[])
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
  return error || !data ? null : (data as Category)
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('authors').select('*').eq('slug', slug).maybeSingle()
  return error || !data ? null : (data as Author)
}

export async function getFirstAuthor(): Promise<Author | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('authors').select('*').order('created_at').limit(1).maybeSingle()
  return error || !data ? null : (data as Author)
}

export async function getAuthors(): Promise<Author[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('authors').select('*').order('name')
  return error ? [] : (data as Author[])
}

async function attachRelations(articles: Article[]): Promise<ArticleWithRelations[]> {
  if (!articles.length) return []
  const supabase = await createClient()
  const authorIds = [...new Set(articles.map((article) => article.author_id))]
  const articleIds = articles.map((article) => article.id)
  const [authorsResult, linksResult] = await Promise.all([
    supabase.from('authors').select('*').in('id', authorIds),
    supabase.from('article_categories').select('*').in('article_id', articleIds),
  ])
  const authors = new Map(((authorsResult.data ?? []) as Author[]).map((author) => [author.id, author]))
  const links = (linksResult.data ?? []) as ArticleCategory[]
  const categoryIds = [...new Set(links.map((link) => link.category_id))]
  const categoriesResult = categoryIds.length
    ? await supabase.from('categories').select('*').in('id', categoryIds)
    : { data: [] }
  const categories = new Map(((categoriesResult.data ?? []) as Category[]).map((category) => [category.id, category]))

  return articles.map((article) => ({
    ...article,
    author: authors.get(article.author_id) ?? null,
    categories: links
      .filter((link) => link.article_id === article.id)
      .map((link) => categories.get(link.category_id))
      .filter((category): category is Category => Boolean(category)),
  }))
}
