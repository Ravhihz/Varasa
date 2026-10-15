import { publicPageMetadata } from '@/lib/utils/metadata'

export const metadata = publicPageMetadata('Kontak', 'Informasi untuk menghubungi tim editorial Varasa.', '/contact')

export default function ContactPage() {
  return <main id="main-content" className="page-shell prose-page"><p className="eyebrow">Kontak</p><h1>Hubungi Varasa</h1><p>Untuk pertanyaan editorial, koreksi artikel, atau kolaborasi, hubungi tim Varasa melalui kanal kontak resmi Varverse.</p><p>Belum ada alamat kontak yang dikonfigurasi di situs ini.</p></main>
}
