'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type LoginState = {
  error?: string
} | null

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email')
  const password = formData.get('password')

  // Basic input validation
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Invalid form submission.' }
  }

  if (!email.trim() || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error || !data.user) {
    // Return a generic message — do not reveal whether the email exists
    return { error: 'Invalid email or password.' }
  }

  // Authorization check: must have admin role in app_metadata
  // Authentication ≠ Authorization
  const isAdmin = data.user.app_metadata?.role === 'admin'

  if (!isAdmin) {
    // Sign out the authenticated-but-unauthorized user immediately
    await supabase.auth.signOut()
    return { error: 'Invalid email or password.' }
  }

  // Redirect to intended destination or dashboard
  redirect('/admin')
}
