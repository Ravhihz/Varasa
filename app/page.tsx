import Link from 'next/link'

// Temporary homepage placeholder — will be replaced in Phase 8 (public website)
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Varasa</h1>
      <p className="text-muted-foreground max-w-sm">
        Publikasi digital tentang bisnis, entrepreneurship, dan digitalisasi UMKM Indonesia.
      </p>
      <p className="text-xs text-muted-foreground/60 mt-4">
        Coming soon — public website under construction.
      </p>
      <Link
        href="/admin/login"
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Admin →
      </Link>
    </main>
  )
}
