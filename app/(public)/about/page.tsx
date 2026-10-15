import { getFirstAuthor } from '@/lib/public-data'
import { publicPageMetadata } from '@/lib/utils/metadata'

export const metadata = publicPageMetadata(
  'Tentang Varasa',
  'Mengenal Varasa, publikasi tentang bisnis, entrepreneurship, dan digitalisasi UMKM Indonesia.',
  '/about',
)

export default async function AboutPage() {
  const author = await getFirstAuthor()
  return <main id="main-content" className="page-shell prose-page">
    <p className="eyebrow">Tentang kami</p><h1>Gagasan untuk usaha yang bertumbuh.</h1>
    <p>Varasa adalah publikasi digital tentang bisnis dan entrepreneurship di Indonesia. Kami membahas strategi usaha, digitalisasi, produktivitas, serta teknologi yang menjawab kebutuhan nyata pelaku bisnis.</p>
    <p>Setiap tulisan dibuat untuk membantu pembaca memahami pilihan dan mengambil langkah yang lebih terarah dalam membangun usaha.</p>
    {author && <section><h2>Penulis</h2><p><a href={`/author/${author.slug}`}>{author.name}</a>{author.bio ? ` — ${author.bio}` : ''}</p></section>}
  </main>
}
