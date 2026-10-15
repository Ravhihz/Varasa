import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Link href="/" className="brand">varasa<span>.</span></Link>
          <p>Gagasan dan panduan untuk bisnis yang terus bertumbuh.</p>
        </div>
        <nav aria-label="Informasi" className="footer-links">
          <Link href="/about">Tentang</Link>
          <Link href="/contact">Kontak</Link>
          <Link href="/editorial-policy">Kebijakan editorial</Link>
          <Link href="/privacy-policy">Privasi</Link>
        </nav>
        <p className="copyright">© {new Date().getFullYear()} Varasa</p>
      </div>
    </footer>
  )
}
