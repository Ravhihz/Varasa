import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { absoluteUrl, SITE_URL } from '@/lib/utils/site'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Varasa', template: '%s | Varasa' },
  description: 'Publikasi digital tentang bisnis, entrepreneurship, dan digitalisasi UMKM Indonesia.',
  icons: { icon: '/varasa.png', shortcut: '/varasa.png', apple: '/varasa.png' },
  openGraph: {
    type: 'website', title: 'Varasa', description: 'Publikasi digital tentang bisnis, entrepreneurship, dan digitalisasi UMKM Indonesia.',
    locale: 'id_ID',
    siteName: 'Varasa', url: SITE_URL, images: [{ url: '/Logo.png' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: absoluteUrl('/') },
  other: { 'google-adsense-account': 'ca-pub-4673236810801627' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4673236810801627"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <Toaster richColors closeButton />
      </body>
    </html>
  )
}
