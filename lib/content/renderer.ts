/**
 * Safe Tiptap JSON renderer for Varasa.
 *
 * Rules:
 * - Renders ONLY approved node and mark types. Unknown types are skipped.
 * - Never injects arbitrary HTML.
 * - Validates link protocols (http, https, mailto only).
 * - Applies rel="noopener noreferrer" on external links.
 * - Handles empty/malformed content gracefully.
 * - Same rules apply for public articles and admin previews.
 */

import type { TiptapDocument, TiptapNode, TiptapMark } from '@/lib/supabase/types'

const APPROVED_NODES = new Set([
  'doc', 'paragraph', 'heading', 'bulletList', 'orderedList',
  'listItem', 'blockquote', 'horizontalRule', 'image', 'text',
])

const APPROVED_MARKS = new Set(['bold', 'italic', 'link'])

const SAFE_LINK_PROTOCOLS = /^(https?:|mailto:)/i

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isSafeUrl(url: unknown): boolean {
  if (typeof url !== 'string' || !url.trim()) return false
  return SAFE_LINK_PROTOCOLS.test(url.trim())
}

function isExternalUrl(url: string): boolean {
  return /^https?:/i.test(url)
}

function renderMark(mark: TiptapMark, inner: string): string {
  if (!APPROVED_MARKS.has(mark.type)) return inner

  switch (mark.type) {
    case 'bold':
      return `<strong>${inner}</strong>`
    case 'italic':
      return `<em>${inner}</em>`
    case 'link': {
      const href = mark.attrs?.href
      if (!isSafeUrl(href)) return inner
      const url = (href as string).trim()
      const rel = isExternalUrl(url) ? ' rel="noopener noreferrer"' : ''
      const target = isExternalUrl(url) ? ' target="_blank"' : ''
      return `<a href="${escapeHtml(url)}"${rel}${target}>${inner}</a>`
    }
    default:
      return inner
  }
}

function renderText(node: TiptapNode): string {
  if (node.type !== 'text') return ''
  let text = escapeHtml(node.text ?? '')

  // Apply marks in reverse order (outermost last)
  if (node.marks && node.marks.length > 0) {
    for (const mark of node.marks) {
      text = renderMark(mark, text)
    }
  }

  return text
}

function renderChildren(nodes: TiptapNode[] | undefined): string {
  if (!nodes || nodes.length === 0) return ''
  return nodes.map(renderNode).join('')
}

function renderNode(node: TiptapNode): string {
  if (!APPROVED_NODES.has(node.type)) return ''

  switch (node.type) {
    case 'text':
      return renderText(node)

    case 'paragraph': {
      const inner = renderChildren(node.content)
      return `<p>${inner}</p>\n`
    }

    case 'heading': {
      const level = typeof node.attrs?.level === 'number'
        ? Math.min(Math.max(node.attrs.level, 2), 3) // only H2-H3
        : 2
      const inner = renderChildren(node.content)
      const id = generateHeadingId(inner)
      return `<h${level} id="${id}">${inner}</h${level}>\n`
    }

    case 'bulletList':
      return `<ul>\n${renderChildren(node.content)}</ul>\n`

    case 'orderedList':
      return `<ol>\n${renderChildren(node.content)}</ol>\n`

    case 'listItem':
      return `<li>${renderChildren(node.content)}</li>\n`

    case 'blockquote':
      return `<blockquote>\n${renderChildren(node.content)}</blockquote>\n`

    case 'horizontalRule':
      return `<hr />\n`

    case 'image': {
      const src = node.attrs?.src
      if (!isSafeUrl(src)) return ''
      const alt = typeof node.attrs?.alt === 'string'
        ? escapeHtml(node.attrs.alt)
        : ''
      const title = typeof node.attrs?.title === 'string'
        ? ` title="${escapeHtml(node.attrs.title)}"`
        : ''
      return `<img src="${escapeHtml(src as string)}" alt="${alt}"${title} loading="lazy" />\n`
    }

    default:
      return ''
  }
}

/**
 * Generate a stable, URL-safe heading ID from rendered HTML.
 * Strips HTML tags, lowercases, replaces spaces with hyphens.
 */
export function generateHeadingId(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')    // strip tags
    .replace(/&[^;]+;/g, '')    // strip HTML entities
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'section'
}

/**
 * Render a Tiptap JSON document to safe HTML string.
 * Returns empty string for null/undefined/malformed input.
 */
export function renderTiptapToHtml(doc: TiptapDocument | null | undefined): string {
  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) return ''
  try {
    return renderChildren(doc.content)
  } catch {
    return ''
  }
}

/**
 * Extract headings from a Tiptap document for Table of Contents.
 */
export interface HeadingEntry {
  id: string
  text: string
  level: number
}

export function extractHeadings(doc: TiptapDocument | null | undefined): HeadingEntry[] {
  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) return []

  const headings: HeadingEntry[] = []

  for (const node of doc.content) {
    if (node.type !== 'heading') continue
    const level = typeof node.attrs?.level === 'number'
      ? Math.min(Math.max(node.attrs.level, 2), 3)
      : 2
    const text = (node.content ?? [])
      .filter(n => n.type === 'text')
      .map(n => n.text ?? '')
      .join('')
    if (!text.trim()) continue
    const id = generateHeadingId(escapeHtml(text))
    headings.push({ id, text, level })
  }

  return headings
}

/**
 * Validate that a value looks like a Tiptap document.
 * Basic structural check — not a full schema validation.
 */
export function isValidTiptapDocument(value: unknown): value is TiptapDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as Record<string, unknown>
  return doc.type === 'doc' && Array.isArray(doc.content)
}
