import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/public/ArticleCard'
import { getCategoryBySlug, getPublishedArticles } from '@/lib/public-data'
import { publicPageMetadata } from '@/lib/utils/metadata'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }
const PAGE_SIZE = 12

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  const requestedPage = Number(query.page ?? 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  return category
    ? publicPageMetadata(
        category.name,
        category.description || `Artikel Varasa tentang ${category.name}.`,
        page === 1 ? `/categories/${category.slug}` : `/categories/${category.slug}?page=${page}`,
      )
    : { title: 'Kategori tidak ditemukan' }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()
  const requestedPage = Number(query.page ?? 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const articles = await getPublishedArticles({ categoryId: category.id, offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE + 1 })
  const hasNext = articles.length > PAGE_SIZE
  const visible = articles.slice(0, PAGE_SIZE)
  return <main id="main-content" className="page-shell content-page">
    <header className="page-heading"><p className="eyebrow">Topik</p><h1>{category.name}</h1>{category.description && <p>{category.description}</p>}</header>
    {visible.length ? <div className="article-grid">{visible.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <div className="empty-state"><p>Belum ada artikel untuk kategori ini.</p></div>}
    <nav className="pagination" aria-label="Navigasi halaman kategori">
      {page > 1 ? <Link rel="prev" href={page === 2 ? `/categories/${slug}` : `/categories/${slug}?page=${page - 1}`}>← Lebih baru</Link> : <span />}
      <span>Halaman {page}</span>
      {hasNext ? <Link rel="next" href={`/categories/${slug}?page=${page + 1}`}>Lebih lama →</Link> : <span />}
    </nav>
  </main>
}
