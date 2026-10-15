import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { EditCategoryForm } from './edit-category-form'

export const metadata: Metadata = {
  title: 'Edit Category',
  robots: { index: false, follow: false },
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Category</h1>
      <EditCategoryForm category={category} />
    </div>
  )
}
