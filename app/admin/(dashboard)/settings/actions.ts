'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/auth'
import { generateSlug, isValidSlug } from '@/lib/utils/slug'

export type ProfileFormState = { error?: string; success?: boolean } | null

export async function upsertAuthorAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized.' }

  const name = String(formData.get('name') ?? '').trim()
  const rawSlug = String(formData.get('slug') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim() || null
  const avatar_url = String(formData.get('avatar_url') ?? '').trim() || null
  const existingId = String(formData.get('id') ?? '').trim() || null

  if (!name) return { error: 'Name is required.' }

  const slug = rawSlug || generateSlug(name)
  if (!isValidSlug(slug)) return { error: 'Slug must be lowercase letters, numbers, and hyphens only.' }

  const supabase = await createClient()

  if (existingId) {
    const { error } = await supabase
      .from('authors')
      .update({ name, slug, bio, avatar_url })
      .eq('id', existingId)
    if (error) return { error: 'Failed to update profile.' }
  } else {
    const { error } = await supabase
      .from('authors')
      .insert({ name, slug, bio, avatar_url })
    if (error) {
      if (error.code === '23505') return { error: 'An author with this slug already exists.' }
      return { error: 'Failed to create profile.' }
    }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/about')
  revalidatePath('/author/[slug]', 'page')
  revalidatePath('/articles/[slug]', 'page')
  revalidatePath('/sitemap.xml')
  return { success: true }
}
