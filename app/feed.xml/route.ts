import { getPublishedArticles } from '@/lib/public-data'
import { absoluteUrl, SITE_URL } from '@/lib/utils/site'

export async function GET() {
  const articles = await getPublishedArticles({ limit: 30 })
  const items = articles.map((article) => {
    const link = absoluteUrl(`/articles/${article.slug}`)
    const description = article.excerpt || article.meta_description || ''
    const publishedAt = article.published_at || article.created_at
    const categories = article.categories
      .map((category) => `<category>${escapeXml(category.name)}</category>`)
      .join('')

    return `<item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(publishedAt).toUTCString()}</pubDate>
      ${article.author ? `<author>${escapeXml(article.author.name)}</author>` : ''}
      ${categories}
    </item>`
  }).join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Varasa</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Publikasi digital tentang bisnis, entrepreneurship, dan digitalisasi UMKM Indonesia.</description>
    <language>id-ID</language>
    ${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
