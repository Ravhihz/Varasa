import Link from 'next/link'
import { ArticleCard } from '@/components/public/ArticleCard'
import { FeaturedArticle } from '@/components/public/FeaturedArticle'
import { getCategories, getPublishedArticles } from '@/lib/public-data'

export default async function HomePage() {
  const [articles, categories] = await Promise.all([
    getPublishedArticles({ limit: 13 }),
    getCategories(),
  ])
  const featured = articles[0]
  const latest = articles.slice(1, 7)

  return (
    <main id="main-content" className="page-shell">
      <section className="home-intro">
        <p className="eyebrow">Bisnis · Gagasan · Pertumbuhan</p>
        <h1>Bangun usaha dengan <em>lebih banyak wawasan.</em></h1>
        <p className="intro-copy">Cerita, strategi, dan panduan praktis untuk para pelaku usaha dan penggerak bisnis di Indonesia.</p>
      </section>
      {featured ? <FeaturedArticle article={featured} /> : <EmptyArticles />}
      {latest.length > 0 && <section className="content-section">
        <SectionHeading title="Tulisan terbaru" href="/articles" />
        <div className="article-grid">{latest.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
      </section>}
      {categories.map((category) => <CategorySection key={category.id} category={category} />)}
    </main>
  )
}

async function CategorySection({ category }: { category: { id: string; name: string; slug: string } }) {
  const articles = await getPublishedArticles({ categoryId: category.id, limit: 3 })
  if (!articles.length) return null
  return <section className="content-section"><SectionHeading title={category.name} href={`/categories/${category.slug}`} /><div className="article-grid">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div></section>
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return <div className="section-heading"><h2>{title}</h2><Link href={href}>Lihat semua <span aria-hidden="true">→</span></Link></div>
}

function EmptyArticles() {
  return <div className="empty-state"><p>Artikel sedang disiapkan.</p><span>Silakan kembali lagi untuk membaca tulisan terbaru.</span></div>
}
