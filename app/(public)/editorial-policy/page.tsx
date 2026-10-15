import { publicPageMetadata } from '@/lib/utils/metadata'

export const metadata = publicPageMetadata('Kebijakan Editorial', 'Prinsip editorial dan standar publikasi Varasa.', '/editorial-policy')

export default function EditorialPolicyPage() {
  return <main id="main-content" className="page-shell prose-page"><p className="eyebrow">Standar publikasi</p><h1>Kebijakan Editorial</h1>
    <p>Varasa menerbitkan tulisan seputar bisnis, entrepreneurship, digitalisasi UMKM, produktivitas, dan teknologi yang relevan bagi pelaku usaha.</p>
    <h2>Prinsip tulisan</h2><p>Artikel ditujukan untuk memberi penjelasan yang berguna dan mudah diterapkan. Kami berupaya menyampaikan konteks dengan jelas serta membedakan informasi faktual dari pandangan penulis.</p>
    <h2>Koreksi dan pembaruan</h2><p>Jika menemukan informasi yang kurang tepat atau sudah berubah, pembaca dapat menyampaikan koreksi melalui kanal kontak resmi Varverse. Artikel dapat diperbarui untuk memperjelas atau memperbaiki informasi.</p>
    <h2>Kemandirian editorial</h2><p>Konten dibuat untuk memberi manfaat kepada pembaca. Hubungan komersial yang relevan perlu diungkapkan pada tulisan terkait.</p>
  </main>
}
