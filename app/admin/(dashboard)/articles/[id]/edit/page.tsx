import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { ArticleForm } from '../../article-form'

export const metadata: Metadata = {
  title: 'Edit Article',
  robots: { index: false, follow: false },
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createClient()

  const [{ data: article }, { data: categories }, { data: articleCats }] = await Promise.all([
    supabase.from('articles').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('name'),
    supabase.from('article_categories').select('category_id').eq('article_id', id),
  ])

  if (!article) notFound()

  const assignedCategoryIds = (articleCats ?? []).map((ac: { category_id: string }) => ac.category_id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Article</h1>
      <ArticleForm
        article={{ ...article, category_ids: assignedCategoryIds }}
        categories={categories ?? []}
      />
    </div>
  )
}
