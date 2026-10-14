import Link from 'next/link'
import { LayoutDashboard, FileText, FolderOpen, Settings } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Articles',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-background">
      {/* Brand */}
      <div className="flex h-14 items-center px-4">
        <Link
          href="/admin"
          className="text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          Varasa
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Admin navigation">
        {navItems.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>
    </aside>
  )
}

function SidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ElementType
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  )
}
