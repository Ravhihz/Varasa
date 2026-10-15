import Link from 'next/link'
import { getCategories } from '@/lib/public-data'
import { PublicNavigation } from './PublicNavigation'

export async function PublicHeader() {
  const categories = await getCategories()
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Varasa, halaman utama">varasa<span>.</span></Link>
        <PublicNavigation categories={categories} />
      </div>
    </header>
  )
}
