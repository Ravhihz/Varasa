import Link from 'next/link'
import type { HeadingEntry } from '@/lib/content/renderer'

export function TableOfContents({ headings }: { headings: HeadingEntry[] }) {
  if (!headings.length) return null
  return (
    <nav className="table-of-contents" aria-label="Daftar isi">
      <h2>Di artikel ini</h2>
      <ol>{headings.map((heading, index) => (
        <li key={`${heading.id}-${index}`} className={heading.level === 3 ? 'toc-subheading' : undefined}>
          <Link href={`#${heading.id}`}>{heading.text}</Link>
        </li>
      ))}</ol>
    </nav>
  )
}
