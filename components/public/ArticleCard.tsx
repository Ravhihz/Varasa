import Image from 'next/image'
import Link from 'next/link'
import type { ArticleWithRelations } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils/date'

export function ArticleCard({ article, featured = false }: { article: ArticleWithRelations; featured?: boolean }) {
  return (
    <article className={`article-card${featured ? ' article-card-featured' : ''}`}>
      <Link href={`/articles/${article.slug}`} className="article-card-image" aria-label={`Baca ${article.title}`}>
        {article.cover_image ? (
          <Image src={article.cover_image} alt="" fill sizes={featured ? '(max-width: 700px) 100vw, 58vw' : '(max-width: 700px) 100vw, 33vw'} className="cover-image" />
        ) : <span className="image-placeholder" aria-hidden="true">V.</span>}
      </Link>
      <div className="article-card-copy">
        {article.categories[0] && <Link className="eyebrow" href={`/categories/${article.categories[0].slug}`}>{article.categories[0].name}</Link>}
        <h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2>
        {article.excerpt && <p>{article.excerpt}</p>}
        <div className="article-byline">
          {article.author && <Link href={`/author/${article.author.slug}`}>{article.author.name}</Link>}
          {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>}
        </div>
      </div>
    </article>
  )
}
