import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { AuthorProfileForm } from './author-profile-form'

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: author } = await supabase
    .from('authors')
    .select('*')
    .limit(1)
    .single()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your author profile.</p>
      </div>
      <AuthorProfileForm author={author ?? null} />
    </div>
  )
}
