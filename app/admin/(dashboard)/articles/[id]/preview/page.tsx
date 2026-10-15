import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/auth'
import { getArticleForPreview } from '@/lib/public-data'
import { ArticleRenderer } from '@/components/public/ArticleRenderer'
import { TableOfContents } from '@/components/public/TableOfContents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { extractHeadings } from '@/lib/content/renderer'
import { formatDate } from '@/lib/utils/date'

export const metadata: Metadata = {
  title: 'Article preview',
  robots: { index: false, follow: false },
}

export default async function ArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const article = await getArticleForPreview(id)
  if (!article) notFound()
  const headings = extractHeadings(article.content_json)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
            {article.status === 'published' ? 'Published preview' : 'Draft preview'}
          </Badge>
          <p className="text-sm text-muted-foreground">Preview of the last saved version.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/articles/${article.id}/edit`}>Back to editor</Link>
        </Button>
      </div>

      <article className="admin-article-preview mx-auto w-full max-w-5xl">
        <header className="mx-auto mb-8 max-w-3xl space-y-4 text-center">
          {article.categories[0] && <p className="text-sm font-medium text-muted-foreground">{article.categories[0].name}</p>}
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{article.title}</h1>
          {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
          <div className="flex justify-center gap-3 text-sm text-muted-foreground">
            {article.author && <span>{article.author.name}</span>}
            {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>}
          </div>
        </header>

        {article.cover_image && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
            <Image src={article.cover_image} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,680px)] lg:justify-center">
          <TableOfContents headings={headings} />
          <ArticleRenderer content={article.content_json} className="admin-preview-content" />
        </div>
      </article>
    </div>
  )
}
