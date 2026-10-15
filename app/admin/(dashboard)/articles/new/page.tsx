import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { ArticleForm } from '../article-form'

export const metadata: Metadata = {
  title: 'New Article',
  robots: { index: false, follow: false },
}

export default async function NewArticlePage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New Article</h1>
      <ArticleForm article={null} categories={categories ?? []} />
    </div>
  )
}
