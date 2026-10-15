import type { ArticleWithRelations } from '@/lib/supabase/types'
import { ArticleCard } from './ArticleCard'

export function FeaturedArticle({ article }: { article: ArticleWithRelations }) {
  return <section aria-label="Artikel pilihan"><ArticleCard article={article} featured /></section>
}
