import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { formatDate, toDateInputValue } from '@/lib/utils/date'

export const metadata: Metadata = {
  title: 'Articles',
  robots: { index: false, follow: false },
}

export default async function AdminArticlesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, status, published_at, created_at, updated_at,
      article_categories ( category_id, categories ( name ) )
    `)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {articles?.length ?? 0} articles
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            New article
          </Button>
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">Failed to load articles.</p>}

      {!error && (!articles || articles.length === 0) && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">No articles yet.</p>
          <Link href="/admin/articles/new" className="mt-2 inline-block">
            <Button size="sm" variant="outline">Write your first article</Button>
          </Link>
        </div>
      )}

      {articles && articles.length > 0 && (
        <div className="rounded-lg border divide-y">
          {articles.map((article) => {
            const isScheduled = article.status === 'published'
              && Boolean(article.published_at && toDateInputValue(article.published_at) > toDateInputValue(new Date()))
            const articleCategories = article.article_categories
              ? Array.isArray(article.article_categories) ? article.article_categories : [article.article_categories]
              : []
            const cats = articleCategories
              .map((ac: { categories: { name: string } | null }) => ac.categories?.name)
              .filter(Boolean)

            return (
              <div key={article.id} className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{article.title}</p>
                    <Badge
                      variant={article.status === 'published' && !isScheduled ? 'default' : 'secondary'}
                      className="shrink-0 text-xs"
                    >
                      {isScheduled ? 'scheduled' : article.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>/{article.slug}</span>
                    {cats.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{cats.join(', ')}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Updated {formatDate(article.updated_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/articles/${article.id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
