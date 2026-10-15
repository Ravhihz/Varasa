import Link from 'next/link'
import { getCategories } from '@/lib/public-data'

export async function PublicHeader() {
  const categories = await getCategories()
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Varasa, halaman utama">varasa<span>.</span></Link>
        <nav aria-label="Navigasi utama" className="site-nav">
          <Link href="/articles">Artikel</Link>
          {categories.slice(0, 4).map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.id}>{category.name}</Link>
          ))}
          <Link href="/about">Tentang</Link>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Buka navigasi">Menu</summary>
          <nav aria-label="Navigasi mobile" className="mobile-nav-panel">
            <Link href="/articles">Semua artikel</Link>
            {categories.map((category) => <Link href={`/categories/${category.slug}`} key={category.id}>{category.name}</Link>)}
            <Link href="/about">Tentang Varasa</Link>
            <Link href="/contact">Kontak</Link>
          </nav>
        </details>
      </div>
    </header>
  )
}
