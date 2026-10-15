import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleCard } from '@/components/public/ArticleCard'
import { getPublishedArticles } from '@/lib/public-data'
import { publicPageMetadata } from '@/lib/utils/metadata'

const PAGE_SIZE = 12

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const params = await searchParams
  const requestedPage = Number(params.page ?? 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const canonical = page === 1 ? '/articles' : `/articles?page=${page}`
  return publicPageMetadata(
    'Artikel',
    'Baca artikel dan panduan Varasa tentang bisnis, entrepreneurship, dan digitalisasi UMKM.',
    canonical,
  )
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const requestedPage = Number(params.page ?? 1)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const articles = await getPublishedArticles({ offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE + 1 })
  const hasNext = articles.length > PAGE_SIZE
  const visible = articles.slice(0, PAGE_SIZE)

  return <main id="main-content" className="page-shell content-page">
    <header className="page-heading"><p className="eyebrow">Arsip tulisan</p><h1>Artikel</h1><p>Wawasan dan panduan untuk menjalankan serta mengembangkan usaha.</p></header>
    {visible.length ? <div className="article-board">{visible.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <div className="empty-state"><p>Belum ada artikel di halaman ini.</p><Link href="/articles">Kembali ke artikel terbaru</Link></div>}
    <nav className="pagination" aria-label="Navigasi halaman artikel">
      {page > 1 ? <Link rel="prev" href={page === 2 ? '/articles' : `/articles?page=${page - 1}`}>← Lebih baru</Link> : <span />}
      <span>Halaman {page}</span>
      {hasNext ? <Link rel="next" href={`/articles?page=${page + 1}`}>Lebih lama →</Link> : <span />}
    </nav>
  </main>
}
