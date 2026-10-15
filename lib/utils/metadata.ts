import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/utils/site'

export function publicPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      url: absoluteUrl(path),
      images: [absoluteUrl('/Logo.png')],
    },
  }
}
