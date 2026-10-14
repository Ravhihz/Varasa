import { createClient } from './server'
import { redirect } from 'next/navigation'

/**
 * Returns the current authenticated user, or redirects to /admin/login.
 * Use in Server Components and Server Actions that require authentication only.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  return user
}

/**
 * Returns the current user only if they are an authorized admin.
 *
 * Authorization is determined by app_metadata.role === 'admin'.
 * This is set manually in Supabase Dashboard:
 *   Authentication → Users → Edit user → app_metadata → { "role": "admin" }
 *
 * Authentication ≠ Authorization:
 * An authenticated user without the admin role will be rejected.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  const isAdmin = user.app_metadata?.role === 'admin'

  if (!isAdmin) {
    // Authenticated but not authorized — redirect to login, not a 403 page,
    // to avoid leaking admin route existence to non-admin users.
    redirect('/admin/login')
  }

  return user
}

/**
 * Checks admin status without redirecting.
 * Use when you need a boolean check in Server Actions.
 * Returns null if not authenticated or not authorized.
 */
export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  if (user.app_metadata?.role !== 'admin') return null

  return user
}
