import Link from 'next/link'
import { FeaturedArticle } from '@/components/public/FeaturedArticle'
import { getPublishedArticles } from '@/lib/public-data'
import { HomeArticleExplorer } from '@/components/public/HomeArticleExplorer'
import { Reveal } from '@/components/public/Reveal'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const articles = await getPublishedArticles({ limit: 7 })
  const featured = articles[0]
  const latest = articles.slice(1, 7)

  return (
    <main id="main-content" className="page-shell">
      <Reveal className="home-intro">
        <p className="eyebrow">Bisnis · Gagasan · Pertumbuhan</p>
        <h1>Bangun usaha dengan <em>lebih banyak wawasan.</em></h1>
        <p className="intro-copy">Cerita, strategi, dan panduan praktis untuk para pelaku usaha dan penggerak bisnis di Indonesia.</p>
        <Button asChild className="hero-cta" size="lg"><Link href="/articles">Jelajahi semua tulisan <span aria-hidden="true">↗</span></Link></Button>
      </Reveal>
      {featured ? <Reveal><FeaturedArticle article={featured} /></Reveal> : <EmptyArticles />}
      {latest.length > 0 && <section className="content-section">
        <SectionHeading title="Tulisan terbaru" href="/articles" />
        <HomeArticleExplorer articles={latest} />
      </section>}
    </main>
  )
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return <div className="section-heading"><h2>{title}</h2><Link href={href}>Lihat semua <span aria-hidden="true">→</span></Link></div>
}

function EmptyArticles() {
  return <div className="empty-state"><p>Artikel sedang disiapkan.</p><span>Silakan kembali lagi untuk membaca tulisan terbaru.</span></div>
}
