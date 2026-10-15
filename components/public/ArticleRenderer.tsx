import { renderTiptapToHtml } from '@/lib/content/renderer'
import type { TiptapDocument } from '@/lib/supabase/types'

interface ArticleRendererProps {
  content: TiptapDocument | null | undefined
  className?: string
}

/**
 * Renders a Tiptap JSON document to HTML using the safe renderer.
 * Same rendering rules apply for public articles and admin previews.
 * Never renders arbitrary HTML — only approved node/mark types.
 */
export function ArticleRenderer({ content, className }: ArticleRendererProps) {
  const html = renderTiptapToHtml(content)

  if (!html) {
    return (
      <div className="text-muted-foreground italic text-sm">
        No content yet.
      </div>
    )
  }

  return (
    <div
      className={[
        // Prose typography
        'prose prose-neutral max-w-none',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-h2:text-2xl prose-h3:text-xl',
        'prose-p:leading-relaxed',
        'prose-a:text-primary prose-a:underline prose-a:underline-offset-4',
        'prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-img:rounded-lg prose-img:w-full',
        'prose-hr:border-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitized by renderTiptapToHtml
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
