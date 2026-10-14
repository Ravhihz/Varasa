<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Varasa — Project Notes for AI Agents

## Overview

Varasa is a custom-built editorial blog platform focused on Business & Entrepreneurship / UMKM Indonesia. It has two surfaces:
1. **Public website** — magazine-style, SEO-first, AdSense-ready
2. **Admin CMS** — custom dashboard for one author to write, publish, and manage content

## Stack

- Next.js 16 App Router + TypeScript strict mode
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Storage)
- Tiptap v3 (rich-text editor, JSON stored in JSONB)
- shadcn/ui (admin UI components)
- Motion for React (selective animations)

## Key Constraints

- **Authorization ≠ Authentication**: Admin role is verified via `app_metadata.role === 'admin'` in Supabase. Use `requireAdmin()` from `lib/supabase/auth.ts` in every admin Server Action and Server Component.
- **Drafts never public**: Articles with `status !== 'published'` must never appear in public listings, sitemaps, RSS feed, or related articles.
- **Content rendering**: Use the safe renderer in `lib/content/renderer.ts` — never render arbitrary HTML. Only approved Tiptap node/mark types.
- **Service-role key**: Server-side only. Never in client code or committed files.
- **No scope expansion**: Implement the defined MVP. Do not add features without explicit approval.
- **Next.js 16 conventions**:
  - Use `proxy.ts` (not `middleware.ts`) — middleware was renamed to proxy in Next.js 16.
  - Use `export const instant = false` on all admin layouts/pages to opt out of static prerendering. Admin routes read cookies and are fully dynamic.
  - Read `node_modules/next/dist/docs/` before writing any Next.js code.

## Important Files

| File | Purpose |
|---|---|
| `notes/req-kiro.md` | Full requirements + confirmed decisions |
| `notes/req-user.md` | User's requirements document |
| `notes/uiux-scope.md` | UI/UX stack and design policies |
| `lib/supabase/auth.ts` | `requireAdmin()` — use in every admin route |
| `lib/supabase/types.ts` | Database type definitions |
| `supabase/migrations/` | Version-controlled SQL migrations |
| `lib/utils/slug.ts` | Slug generation and validation |

## Migration Order

Run migrations in order: 001 → 002 → 003 → 004 → 005

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `NEXT_PUBLIC_SITE_URL`
