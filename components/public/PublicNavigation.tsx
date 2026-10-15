'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type CategoryLink = { id: string; name: string; slug: string }

export function PublicNavigation({ categories }: { categories: CategoryLink[] }) {
  const pathname = usePathname()
  const links = [
    { href: '/articles', label: 'Artikel' },
    ...categories.slice(0, 4).map((category) => ({ href: `/categories/${category.slug}`, label: category.name })),
    { href: '/about', label: 'Tentang' },
  ]

  return (
    <div className="site-actions">
      <nav aria-label="Navigasi utama" className="site-nav">
        {links.map((link) => <Link className={pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'is-active' : undefined} href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="mobile-menu-trigger" variant="outline" size="icon" aria-label="Buka navigasi"><Menu /></Button>
        </SheetTrigger>
        <SheetContent className="mobile-sheet" side="right">
          <SheetHeader>
            <SheetTitle className="brand mobile-sheet-brand">varasa<span>.</span></SheetTitle>
            <SheetDescription>Gagasan dan panduan untuk bisnis yang terus bertumbuh.</SheetDescription>
          </SheetHeader>
          <nav aria-label="Navigasi mobile" className="mobile-sheet-nav">
            {[{ href: '/', label: 'Beranda' }, ...links, { href: '/contact', label: 'Kontak' }].map((link) => (
              <SheetClose asChild key={link.href}>
                <Link href={link.href} className={pathname === link.href ? 'is-active' : undefined}>{link.label}<ArrowUpRight aria-hidden="true" /></Link>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
