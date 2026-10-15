import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/public/ArticleCard'
import { getAuthorBySlug, getPublishedArticles } from '@/lib/public-data'
import { publicPageMetadata } from '@/lib/utils/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  return author
    ? publicPageMetadata(author.name, author.bio || `Tulisan oleh ${author.name} di Varasa.`, `/author/${author.slug}`)
    : { title: 'Penulis tidak ditemukan' }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()
  const articles = await getPublishedArticles({ authorId: author.id, limit: 24 })
  return <main id="main-content" className="page-shell content-page">
    <header className="author-profile">
      {author.avatar_url && <Image src={author.avatar_url} alt="" width={96} height={96} className="author-avatar" />}
      <div><p className="eyebrow">Penulis</p><h1>{author.name}</h1>{author.bio && <p>{author.bio}</p>}</div>
    </header>
    <section className="content-section"><div className="section-heading"><h2>Tulisan oleh {author.name}</h2></div>
      {articles.length ? <div className="article-grid">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <div className="empty-state"><p>Belum ada artikel dari penulis ini.</p></div>}
    </section>
  </main>
}
