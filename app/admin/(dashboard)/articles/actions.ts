'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/auth'
import { generateSlug, isValidSlug } from '@/lib/utils/slug'
import { isValidTiptapDocument } from '@/lib/content/renderer'
import type { ArticleStatus, TiptapDocument } from '@/lib/supabase/types'

export type ArticleFormState = { error?: string; success?: boolean; id?: string } | null

// ---------------------------------------------------------------------------
// Create article
// ---------------------------------------------------------------------------
export async function createArticleAction(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const parsed = parseArticleFormData(formData)
  if ('error' in parsed) return { error: parsed.error }

  const supabase = await createClient()

  // Resolve author_id
  const { data: author } = await supabase.from('authors').select('id').limit(1).single()
  if (!author) return { error: 'Author profile not found. Please create one in Settings first.' }

  // published_at: set now if publishing, otherwise null
  const published_at = parsed.status === 'published' ? (parsed.published_at ?? new Date().toISOString()) : parsed.published_at

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      author_id: author.id,
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content_json: parsed.content_json,
      cover_image: parsed.cover_image,
      status: parsed.status,
      seo_title: parsed.seo_title,
      meta_description: parsed.meta_description,
      published_at,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'An article with this slug already exists.' }
    return { error: 'Failed to create article. Please try again.' }
  }

  // Assign categories
  if (parsed.category_ids.length > 0) {
    await supabase.from('article_categories').insert(
      parsed.category_ids.map((cid) => ({ article_id: article.id, category_id: cid }))
    )
  }

  revalidateArticlePaths(parsed.slug)
  redirect(`/admin/articles/${article.id}/edit`)
}

// ---------------------------------------------------------------------------
// Update article
// ---------------------------------------------------------------------------
export async function updateArticleAction(
  articleId: string,
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const parsed = parseArticleFormData(formData)
  if ('error' in parsed) return { error: parsed.error }

  const supabase = await createClient()

  // Get existing article to check previous status and published_at
  const { data: existing } = await supabase
    .from('articles')
    .select('status, published_at, slug')
    .eq('id', articleId)
    .single()

  if (!existing) return { error: 'Article not found.' }

  // published_at rules:
  // - If already published: preserve existing published_at (do not overwrite)
  // - If publishing for first time: set to provided value or now
  // - If saving as draft: preserve whatever value exists
  let published_at: string | null = existing.published_at
  if (existing.status !== 'published' && parsed.status === 'published') {
    published_at = parsed.published_at ?? existing.published_at ?? new Date().toISOString()
  } else if (existing.status === 'published' && parsed.status === 'published') {
    // Allow manual edit of published_at for published articles
    published_at = parsed.published_at ?? existing.published_at
  }

  const { error } = await supabase
    .from('articles')
    .update({
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content_json: parsed.content_json,
      cover_image: parsed.cover_image,
      status: parsed.status,
      seo_title: parsed.seo_title,
      meta_description: parsed.meta_description,
      published_at,
    })
    .eq('id', articleId)

  if (error) {
    if (error.code === '23505') return { error: 'An article with this slug already exists.' }
    return { error: 'Failed to update article.' }
  }

  // Replace categories
  await supabase.from('article_categories').delete().eq('article_id', articleId)
  if (parsed.category_ids.length > 0) {
    await supabase.from('article_categories').insert(
      parsed.category_ids.map((cid) => ({ article_id: articleId, category_id: cid }))
    )
  }

  revalidateArticlePaths(parsed.slug)
  if (existing.slug !== parsed.slug) revalidateArticlePaths(existing.slug)

  return { success: true }
}

// ---------------------------------------------------------------------------
// Delete article
// ---------------------------------------------------------------------------
export async function deleteArticleAction(id: string): Promise<{ error?: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const supabase = await createClient()

  const { data: article } = await supabase.from('articles').select('slug').eq('id', id).single()

  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) return { error: 'Failed to delete article.' }

  if (article?.slug) revalidateArticlePaths(article.slug)
  redirect('/admin/articles')
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function revalidateArticlePaths(slug: string) {
  revalidatePath('/admin/articles')
  revalidatePath(`/articles/${slug}`)
  revalidatePath('/articles')
  revalidatePath('/articles/[slug]', 'page')
  revalidatePath('/categories/[slug]', 'page')
  revalidatePath('/author/[slug]', 'page')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
  revalidatePath('/feed.xml')
}

type ParsedArticle = {
  title: string
  slug: string
  excerpt: string | null
  content_json: TiptapDocument | null
  cover_image: string | null
  status: ArticleStatus
  seo_title: string | null
  meta_description: string | null
  published_at: string | null
  category_ids: string[]
}

function parseArticleFormData(formData: FormData): ParsedArticle | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const rawSlug = String(formData.get('slug') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '').trim() || null
  const contentRaw = String(formData.get('content_json') ?? '').trim()
  const cover_image = String(formData.get('cover_image') ?? '').trim() || null
  const statusRaw = String(formData.get('status') ?? 'draft')
  const seo_title = String(formData.get('seo_title') ?? '').trim() || null
  const meta_description = String(formData.get('meta_description') ?? '').trim() || null
  const published_at_raw = String(formData.get('published_at') ?? '').trim()
  const category_ids = formData.getAll('category_ids').map(String).filter(Boolean)

  if (!title) return { error: 'Title is required.' }

  const slug = rawSlug || generateSlug(title)
  if (!isValidSlug(slug)) return { error: 'Slug must be lowercase letters, numbers, and hyphens only.' }

  const status: ArticleStatus = statusRaw === 'published' ? 'published' : 'draft'

  let content_json: TiptapDocument | null = null
  if (contentRaw) {
    try {
      const parsed = JSON.parse(contentRaw)
      content_json = isValidTiptapDocument(parsed) ? parsed : null
    } catch {
      return { error: 'Invalid content format.' }
    }
  }

  const published_at = published_at_raw
    ? new Date(`${published_at_raw}T00:00:00+07:00`).toISOString()
    : null

  return { title, slug, excerpt, content_json, cover_image, status, seo_title, meta_description, published_at, category_ids }
}
