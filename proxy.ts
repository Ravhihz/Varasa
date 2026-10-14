import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh session cookies on every request
  const { supabaseResponse, user } = await updateSession(request)

  // ---------------------------------------------------------------------------
  // Admin route protection
  // ---------------------------------------------------------------------------
  // All /admin/* routes are protected except /admin/login.
  // Note: this checks authentication only. Authorization (admin role) is
  // enforced separately in each Server Action and Server Component via
  // requireAdmin() from lib/supabase/auth.ts.
  // ---------------------------------------------------------------------------
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
