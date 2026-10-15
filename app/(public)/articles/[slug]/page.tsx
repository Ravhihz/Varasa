import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdSlot } from '@/components/public/AdSlot'
import { ArticleCard } from '@/components/public/ArticleCard'
import { ArticleRenderer } from '@/components/public/ArticleRenderer'
import { TableOfContents } from '@/components/public/TableOfContents'
import { extractHeadings } from '@/lib/content/renderer'
import { getPublishedArticleBySlug, getPublishedArticles } from '@/lib/public-data'
import { formatDate } from '@/lib/utils/date'
import { absoluteUrl, safeJsonLd } from '@/lib/utils/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) return { title: 'Artikel tidak ditemukan' }
  const description = article.meta_description || article.excerpt || ''
  return {
    title: article.seo_title || article.title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article', title: article.seo_title || article.title, description,
      url: absoluteUrl(`/articles/${article.slug}`),
      publishedTime: article.published_at ?? undefined,
      authors: article.author ? [`/author/${article.author.slug}`] : undefined,
      images: article.cover_image ? [article.cover_image] : [absoluteUrl('/Logo.png')],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) notFound()
  const [related] = await Promise.all([
    getPublishedArticles({ excludeId: article.id, limit: 3, categoryId: article.categories[0]?.id }),
  ])
  const headings = extractHeadings(article.content_json)
  const pageUrl = absoluteUrl(`/articles/${article.slug}`)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.meta_description || article.excerpt || undefined,
    image: article.cover_image ? [new URL(article.cover_image, pageUrl).toString()] : undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    author: article.author ? {
      '@type': 'Person',
      name: article.author.name,
      url: absoluteUrl(`/author/${article.author.slug}`),
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Varasa',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/Logo.png') },
    },
  }

  return <main id="main-content" className="page-shell article-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    <article>
      <header className="article-header">
        {article.categories[0] && <Link className="eyebrow" href={`/categories/${article.categories[0].slug}`}>{article.categories[0].name}</Link>}
        <h1>{article.title}</h1>
        {article.excerpt && <p className="article-deck">{article.excerpt}</p>}
        <div className="article-byline article-byline-large">
          {article.author && <span>Oleh <Link href={`/author/${article.author.slug}`}>{article.author.name}</Link></span>}
          {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>}
        </div>
      </header>
      {article.cover_image && <div className="article-cover"><Image src={article.cover_image} alt="" fill priority sizes="(max-width: 900px) 100vw, 900px" className="cover-image" /></div>}
      <div className="article-body-layout">
        <TableOfContents headings={headings} />
        <ArticleRenderer content={article.content_json} className="article-prose" />
      </div>
      <AdSlot />
    </article>
    {related.length > 0 && <section className="content-section related-section"><div className="section-heading"><h2>Artikel terkait</h2></div><div className="article-grid">{related.map((item) => <ArticleCard key={item.id} article={item} />)}</div></section>}
  </main>
}
