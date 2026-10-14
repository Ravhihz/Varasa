import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://varasa.id'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Varasa',
    template: '%s | Varasa',
  },
  description:
    'Publikasi digital tentang bisnis, entrepreneurship, dan digitalisasi UMKM Indonesia.',
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Varasa',
    url: siteUrl,
    images: [{ url: '/Logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
