import { publicPageMetadata } from '@/lib/utils/metadata'

export const metadata = publicPageMetadata('Kebijakan Privasi', 'Kebijakan privasi dan penggunaan data di Varasa.', '/privacy-policy')

export default function PrivacyPolicyPage() {
  return <main id="main-content" className="page-shell prose-page"><p className="eyebrow">Informasi</p><h1>Kebijakan Privasi</h1>
    <p>Varasa menyediakan artikel dan informasi seputar bisnis. Halaman publik tidak meminta pengunjung membuat akun atau mengirimkan data melalui formulir.</p>
    <h2>Data teknis</h2><p>Penyedia hosting dan infrastruktur dapat memproses data teknis yang diperlukan untuk mengirimkan halaman dan menjaga keamanan layanan, seperti alamat IP, jenis peramban, dan waktu permintaan.</p>
    <h2>Cookie</h2><p>Cookie autentikasi digunakan pada area administrasi untuk penulis. Area tersebut tidak ditujukan untuk pengunjung umum.</p>
    <h2>Layanan pihak ketiga</h2><p>Konten dan gambar dapat disimpan melalui layanan infrastruktur pihak ketiga. Penggunaan layanan tersebut mengikuti kebijakan privasi masing-masing penyedia.</p>
    <h2>Perubahan</h2><p>Kebijakan ini dapat diperbarui ketika fitur atau praktik pengelolaan data Varasa berubah.</p>
  </main>
}
