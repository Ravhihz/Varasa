# Varasa — MVP Checklist

> Status terakhir diupdate: Oktober 2026
> Format: ✅ Selesai | 🔄 In Progress | ⬜ Belum mulai

> **Progress audit:** Fase 2 sudah clear menurut konfirmasi user. Fase 8 dan 9 sudah diimplementasikan. Preview artikel admin-only juga tersedia. Fase 10 masih memerlukan pemeriksaan production build akhir dan verifikasi end-to-end dengan akun admin.

---

## Phase 1 — Project Setup ✅

- [x] create-next-app dengan TypeScript strict, Tailwind v4, App Router
- [x] shadcn/ui init (Nova preset, Radix, Lucide)
- [x] Install dependencies: @supabase/supabase-js, @supabase/ssr, Tiptap v3, Motion
- [x] `.env.example` dengan semua required env vars
- [x] `next.config.ts` — Supabase Storage image domain
- [x] Logo dan favicon diganti dengan `public/Logo.png`
- [x] `app/layout.tsx` — metadata global (title template, OG, icons)
- [x] `AGENTS.md` — project notes untuk AI agents

---

## Phase 2 — Database & Security ✅

- [x] `supabase/migrations/001_create_authors.sql`
- [x] `supabase/migrations/002_create_categories.sql`
- [x] `supabase/migrations/003_create_articles.sql` + updated_at trigger
- [x] `supabase/migrations/004_create_article_categories.sql` (many-to-many)
- [x] `supabase/migrations/005_rls_and_policies.sql` — is_admin(), RLS semua tabel
- [x] `lib/supabase/types.ts` — Database types + Tiptap JSON types
- [x] `lib/supabase/client.ts` — browser client
- [x] `lib/supabase/server.ts` — server client (cookie-based)
- [x] `lib/supabase/middleware.ts` — session refresh helper
- [x] `lib/supabase/auth.ts` — requireAdmin(), requireAuth(), getAdminUser()
- [x] `lib/utils/slug.ts` — generateSlug(), isValidSlug(), ensureUniqueSlug()
- [x] Jalankan migrations di Supabase Dashboard
- [x] Buat bucket `varasa-media` + Storage policies
- [x] Set `app_metadata.role = "admin"` pada user admin di Supabase Dashboard

---

## Phase 3 — Admin Auth & Layout 🔄

- [x] `proxy.ts` — route protection (Next.js 16, menggantikan middleware.ts)
- [x] `app/admin/login/page.tsx` — login page
- [x] `app/admin/login/login-form.tsx` — form dengan useActionState
- [x] `app/admin/login/actions.ts` — loginAction dengan authorization check
- [x] `app/admin/login/layout.tsx` — login layout (no sidebar)
- [x] `app/admin/layout.tsx` — admin layout dengan requireAdmin() + instant = false
- [x] `app/admin/page.tsx` — dashboard overview dengan stats
- [x] `app/admin/actions.ts` — logoutAction
- [x] `components/admin/AdminSidebar.tsx` — sidebar navigasi
- [x] `components/admin/AdminHeader.tsx` — header dengan logout button
- [x] `components/admin/LogoutButton.tsx` — client component
- [ ] Install shadcn components: `npx shadcn@latest add input label card separator badge`
- [ ] Verifikasi login/logout flow berfungsi (butuh Supabase + admin user)

---

## Phase 4 — Design System & Admin UI ⬜

- [ ] Design tokens: typography scale, color palette, spacing di globals.css
- [ ] Install shadcn components: `table dialog dropdown-menu toast skeleton form textarea select avatar sheet`
- [ ] Admin article list page (`/admin/articles`)
- [ ] Admin category list page (`/admin/categories`)
- [ ] Admin settings page (`/admin/settings`) — author profile editor

---

## Phase 5 — Rich-Text Editor & Safe Renderer ⬜

- [ ] Tiptap editor component (`components/admin/Editor.tsx`)
  - Supported: paragraph, heading H2-H3, bold, italic, bullet list, ordered list, blockquote, hr, link, image
- [ ] `lib/content/renderer.ts` — safe Tiptap JSON renderer (no arbitrary HTML)
- [ ] `components/public/ArticleRenderer.tsx` — public wrapper
- [ ] Validasi link protocols (http/https/mailto only)
- [ ] Same rendering rules untuk public + admin preview

---

## Phase 6 — Image Upload ⬜

- [ ] `components/admin/ImageUpload.tsx` — upload component
- [ ] `app/api/upload/route.ts` — upload API route (admin only)
- [ ] Validasi: MIME type (jpeg/png/webp), max 2MB
- [ ] Collision-resistant storage paths
- [ ] Cover image replacement support

---

## Phase 7 — Admin CMS (Article + Category CRUD) ⬜

- [ ] `app/admin/articles/page.tsx` — list artikel dengan status badge
- [ ] `app/admin/articles/new/page.tsx` — buat artikel baru
- [ ] `app/admin/articles/[id]/edit/page.tsx` — edit artikel
- [ ] Article form: title, slug (auto + editable), excerpt, cover image, editor, categories, SEO fields
- [ ] Draft / Publish / Unpublish workflow
- [ ] `published_at`: auto-set saat pertama publish, preserve saat edit
- [x] Preview artikel (admin-only, tidak accessible publik)
- [ ] `app/admin/categories/page.tsx` — CRUD kategori
- [ ] `app/admin/settings/page.tsx` — author profile editor (nama, slug, bio, avatar)
- [ ] Konfirmasi sebelum destructive actions
- [ ] Loading, success, validation, error states

---

## Phase 8 — Public Website ✅

- [x] Homepage (`app/(public)/page.tsx`) — featured article, latest grid, category sections
- [x] Article listing (`app/(public)/articles/page.tsx`) — pagination
- [x] Article detail (`app/(public)/articles/[slug]/page.tsx`) — ToC, related articles, AdSlot
- [x] Category page (`app/(public)/categories/[slug]/page.tsx`) — pagination
- [x] Author page (`app/(public)/author/[slug]/page.tsx`)
- [x] About page (`app/(public)/about/page.tsx`)
- [x] Contact page (`app/(public)/contact/page.tsx`) — informational only
- [x] Privacy Policy (`app/(public)/privacy-policy/page.tsx`)
- [x] Editorial Policy (`app/(public)/editorial-policy/page.tsx`)
- [x] Navbar + Footer
- [x] `components/public/ArticleCard.tsx`
- [x] `components/public/FeaturedArticle.tsx`
- [x] `components/public/TableOfContents.tsx`
- [x] `components/public/AdSlot.tsx` — placeholder, no live integration
- [x] Public data queries filter to published articles
- [x] Responsive editorial styling, skip link, focus states, reduced-motion support

---

## Phase 9 — SEO, RSS & Technical ✅

- [x] `app/sitemap.ts` — dynamic XML sitemap (published only)
- [x] `app/robots.ts` — robots.txt
- [x] `app/feed.xml/route.ts` — RSS 2.0 feed (published only)
- [x] JSON-LD structured data (BlogPosting schema) di article detail
- [x] `generateMetadata()` per halaman (title, description, OG, canonical)
- [x] Cache invalidation (`revalidatePath`) setelah publish/unpublish/edit
- [x] Noindex pada halaman admin dan draft preview

---

## Phase 10 — Final Checks ⬜

- [ ] `npm run build` berhasil tanpa error
- [x] TypeScript strict check lulus (`tsc --noEmit`)
- [x] `npm run lint` clean
- [ ] Lighthouse Performance > 90 pada halaman artikel
- [ ] Test: authenticated non-admin tidak bisa mutasi data
- [ ] Test: draft tidak muncul di publik, sitemap, RSS
- [ ] Test: draft preview tidak accessible oleh publik
- [ ] Test: publish/unpublish invalidate cache
- [ ] Test: upload validasi MIME dan ukuran
- [ ] Responsive check: mobile, tablet, desktop
- [ ] Keyboard navigation + visible focus states
- [ ] Tidak ada service-role key di client bundle
- [ ] Visual refinement pass → design freeze
- [ ] README update: local setup, migrations, Supabase config, deployment

---

## Acceptance Criteria (dari req-kiro.md)

- [ ] Project install, build, dan TypeScript strict check lulus
- [ ] Admin authorized bisa login dan akses dashboard
- [ ] Authenticated tapi unauthorized user tidak bisa write data
- [ ] Admin bisa create, edit, save draft, preview, publish, dan unpublish artikel
- [ ] Draft tidak pernah muncul di halaman publik, sitemap, atau RSS feed
- [ ] Draft preview tidak accessible oleh publik
- [ ] Artikel published ter-render dari Tiptap JSON dengan safe renderer
- [ ] Slug artikel unik dan URL berfungsi
- [ ] Kategori bisa dibuat dan di-assign ke artikel (many-to-many)
- [ ] Upload cover image dan gambar inline berfungsi sesuai access rules
- [ ] SEO metadata dan canonical URL ter-generate dengan benar
- [ ] Sitemap, robots.txt, dan RSS feed berfungsi dan tidak expose drafts
- [ ] Halaman publik responsive dan keyboard-accessible
- [ ] Publish dan unpublish invalidate cache yang sesuai
- [ ] Error states dan validasi ditangani tanpa data loss
- [ ] Tidak ada credentials yang terekspos di client bundle atau committed files
