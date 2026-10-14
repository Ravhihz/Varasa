import { requireAdmin } from '@/lib/supabase/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

// Admin routes are fully dynamic — they require auth cookies on every request.
// Opt out of static prerendering entirely.
export const instant = false

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforces both authentication and admin authorization.
  // Redirects to /admin/login if not authenticated or not authorized.
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
