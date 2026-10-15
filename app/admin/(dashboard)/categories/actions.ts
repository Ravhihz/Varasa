'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/auth'
import { generateSlug, isValidSlug } from '@/lib/utils/slug'

export type CategoryFormState = {
  error?: string
  success?: boolean
} | null

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const name = String(formData.get('name') ?? '').trim()
  const rawSlug = String(formData.get('slug') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null

  if (!name) return { error: 'Name is required.' }

  const slug = rawSlug || generateSlug(name)
  if (!isValidSlug(slug)) return { error: 'Slug must be lowercase letters, numbers, and hyphens only.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .insert({ name, slug, description })

  if (error) {
    if (error.code === '23505') return { error: 'A category with this slug already exists.' }
    return { error: 'Failed to create category. Please try again.' }
  }

  revalidatePath('/admin/categories')
  revalidatePublicCategoryPaths()
  return { success: true }
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const name = String(formData.get('name') ?? '').trim()
  const rawSlug = String(formData.get('slug') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null

  if (!name) return { error: 'Name is required.' }

  const slug = rawSlug || generateSlug(name)
  if (!isValidSlug(slug)) return { error: 'Slug must be lowercase letters, numbers, and hyphens only.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({ name, slug, description })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'A category with this slug already exists.' }
    return { error: 'Failed to update category.' }
  }

  revalidatePath('/admin/categories')
  revalidatePublicCategoryPaths()
  return { success: true }
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') return { error: 'Cannot delete a category that has articles assigned to it.' }
    return { error: 'Failed to delete category.' }
  }

  revalidatePath('/admin/categories')
  revalidatePublicCategoryPaths()
  return {}
}

function revalidatePublicCategoryPaths() {
  revalidatePath('/categories/[slug]', 'page')
  revalidatePath('/articles/[slug]', 'page')
  revalidatePath('/articles')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
  revalidatePath('/feed.xml')
}
