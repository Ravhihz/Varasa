import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { DeleteCategoryButton } from './delete-category-button'
import { CategoryForm } from './category-form'

export const metadata: Metadata = {
  title: 'Categories',
  robots: { index: false, follow: false },
}

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories?.length ?? 0} categories
          </p>
        </div>
      </div>

      {/* Add new category */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-medium">Add category</h2>
        <CategoryForm />
      </div>

      {/* Category list */}
      {error && (
        <p className="text-sm text-destructive">Failed to load categories.</p>
      )}
      {!error && (!categories || categories.length === 0) && (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      )}
      {categories && categories.length > 0 && (
        <div className="rounded-lg border divide-y">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground truncate">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/categories/${cat.id}/edit`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
                <DeleteCategoryButton id={cat.id} name={cat.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
