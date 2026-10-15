'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/supabase/types'
import { ArticleCard } from './ArticleCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function HomeArticleExplorer({ articles }: { articles: ArticleWithRelations[] }) {
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [search, setSearch] = useState('')
  const categories = useMemo(() => [...new Set(articles.flatMap((article) => article.categories.map((category) => category.name)))], [articles])
  const filtered = articles.filter((article) => {
    const matchesCategory = activeCategory === 'Semua' || article.categories.some((category) => category.name === activeCategory)
    const needle = search.trim().toLocaleLowerCase('id-ID')
    const searchable = [article.title, article.excerpt ?? '', ...article.categories.map((category) => category.name)].join(' ').toLocaleLowerCase('id-ID')
    return matchesCategory && (!needle || searchable.includes(needle))
  })

  return (
    <div className="home-explorer">
      <div className="explorer-toolbar">
        <div className="explorer-filters" aria-label="Filter kategori artikel">
          {['Semua', ...categories].map((category) => (
            <Button
              key={category}
              type="button"
              size="sm"
              variant={activeCategory === category ? 'default' : 'outline'}
              className="explorer-filter"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="explorer-search">
          <Search aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tulisan..." aria-label="Cari tulisan" />
          {search && <Button type="button" variant="ghost" size="icon-sm" aria-label="Hapus pencarian" onClick={() => setSearch('')}><X /></Button>}
        </div>
      </div>
      {filtered.length ? (
        <div className="article-board home-article-board">
          {filtered.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      ) : (
        <div className="explorer-empty">
          <p>Tidak ada tulisan yang cocok.</p>
          <Button type="button" variant="outline" onClick={() => { setActiveCategory('Semua'); setSearch('') }}>Atur ulang filter</Button>
        </div>
      )}
      <p className="explorer-count">Menampilkan {filtered.length} dari {articles.length} tulisan</p>
    </div>
  )
}
