import type { MetadataRoute } from 'next'
import { getAuthors, getCategories, getPublishedArticles } from '@/lib/public-data'
import { absoluteUrl } from '@/lib/utils/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, authors] = await Promise.all([
    getPublishedArticles(),
    getCategories(),
    getAuthors(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/articles'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.4 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/privacy-policy'), changeFrequency: 'yearly', priority: 0.1 },
    { url: absoluteUrl('/editorial-policy'), changeFrequency: 'yearly', priority: 0.2 },
  ]

  return [
    ...staticPages,
    ...categories.map((category) => ({
      url: absoluteUrl(`/categories/${category.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...authors.map((author) => ({
      url: absoluteUrl(`/author/${author.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
