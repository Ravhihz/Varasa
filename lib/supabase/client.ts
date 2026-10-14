import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Browser-side Supabase client.
 * Use in Client Components only ('use client').
 * Session is managed via cookies by the SSR middleware.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
