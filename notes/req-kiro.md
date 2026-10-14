# Varasa — Requirements Document (Kiro Planning)

> Dokumen ini dibuat berdasarkan sesi planning antara user dan Kiro.
> Sudah di-reconcile dengan `req-user.md` dan `uiux-scope.md`.
> Keputusan implementasi di bagian bawah bersifat final untuk MVP.

---

## Konsep & Positioning

**Nama:** Varasa  
**Tagline:** Publikasi digital untuk bisnis dan entrepreneurship Indonesia  
**Niche Utama:** Business & Entrepreneurship — fokus digitalisasi UMKM dan pertumbuhan bisnis di Indonesia  
**Niche Pendukung:** Tech & Developer — khususnya yang relevan langsung dengan kebutuhan bisnis (website, SaaS, otomasi, pemilihan software bisnis)

**Target Pembaca:**
- Calon pengusaha dan solopreneur
- Pelaku UMKM yang ingin digitalisasi
- Pemilik bisnis kecil yang ingin tumbuh dengan teknologi

**Model Penulis:** Penulis pribadi dengan identitas jelas (bukan anonim)

---

## Tujuan & Monetisasi

- Bangun trafik organik melalui konten berbasis riset, pengalaman nyata, dan studi kasus
- **Monetisasi:** Google AdSense (placement components, tidak require live integration atau account approval) + inbound leads
- Vercel Analytics: opsional, bukan requirement MVP
- Jangka panjang: membangun kepercayaan dan otoritas di niche bisnis Indonesia

---

## Tech Stack

| Layer | Pilihan | Keterangan |
|---|---|---|
| Framework | Next.js App Router | SSR/SSG native, SEO optimal |
| Language | TypeScript (strict mode) | Type-safe |
| Styling | Tailwind CSS v4 | Utility-first |
| Components | shadcn/ui | Admin UI: forms, tables, dialogs, badges, toast, skeleton, empty/error states |
| Icons | Lucide | Konsisten dengan shadcn/ui |
| Animation | Motion for React | Selektif — bukan setiap komponen |
| Database | Supabase PostgreSQL | Relational, RLS built-in |
| Auth | Supabase Auth + `@supabase/ssr` | Session via cookie, server-side |
| Storage | Supabase Storage | Cover image + gambar konten |
| Editor | Novel.js (verify compatibility first; fallback: Tiptap langsung) | Notion-like UX |
| Deploy | Vercel | Next.js native |
| Analytics | Vercel Analytics | Opsional |

> **Novel.js compatibility check:** Verifikasi maintenance status dan kompatibilitas dengan versi React, Next.js, dan Tiptap yang dipilih sebelum integrasi. Jika tidak kompatibel, gunakan Tiptap langsung. Format JSON konten dan schema database tidak berubah regardless pilihan editor.

> **React Bits:** Inspiration only. Tidak diinstall, tidak masuk dependencies.

---

## UI/UX Stack & Policies

**Animation policy:**
- CSS transitions untuk hover dan focus dasar
- Motion for React hanya untuk: mobile nav, drawers, entrance transitions terpilih, coordinated layout changes
- Wajib respect `prefers-reduced-motion`
- Tidak delay konten atau user interactions
- Tidak animate setiap card atau komponen

**Design system (define before implementing any page):**
- Typography scale
- Color palette + brand tokens
- Spacing scale, container widths, breakpoints
- Image ratios, border radius, shadows
- Component variants

**Design freeze policy:**
- Setelah functional MVP selesai → satu visual refinement pass → design difreeze
- Tidak boleh redesign screen yang sudah diapprove tanpa alasan konkret: verified bug, accessibility issue, responsive failure, usability problem, atau performance concern terukur

**Strict scope boundaries:**
- Tidak boleh tambah UI library tanpa approval eksplisit
- Tidak boleh duplikasi komponen shadcn/ui yang sudah ada tanpa alasan fungsional
- Tidak boleh tambah dekoratif kompleks yang merusak performance, accessibility, atau reading comfort

---

## Arsitektur Database

> Setiap tabel dibuat sekali melalui version-controlled SQL migrations. Tidak ada duplikasi definisi.

### Tabel: `authors`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| bio | text | |
| avatar_url | text | |
| created_at | timestamptz | DEFAULT now() |

### Tabel: `categories`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| description | text | |
| created_at | timestamptz | DEFAULT now() |

### Tabel: `articles`
| Kolom | Tipe | Catatan |
|---|---|---|
| id | uuid PK | |
| author_id | uuid FK → authors | ON DELETE RESTRICT |
| title | text NOT NULL | |
| slug | text UNIQUE NOT NULL | |
| excerpt | text | |
| content_json | jsonb | Validated against supported Tiptap schema |
| cover_image | text | Public URL dari Supabase Storage |
| status | text NOT NULL | 'draft' atau 'published', DEFAULT 'draft' |
| seo_title | text | |
| meta_description | text | |
| published_at | timestamptz | Editorial metadata, dapat diedit manual. Di-set saat publish jika null. Dipreserve saat edit artikel yang sudah published. |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now(), update via trigger |

### Tabel: `article_categories` (many-to-many)
| Kolom | Tipe | Catatan |
|---|---|---|
| article_id | uuid FK → articles | ON DELETE CASCADE |
| category_id | uuid FK → categories | ON DELETE RESTRICT |

> PRIMARY KEY (article_id, category_id)

**Indexes:**
- `articles(slug)` — unique lookup
- `articles(status, published_at DESC)` — public listing queries
- `categories(slug)` — unique lookup
- `authors(slug)` — unique lookup

**RLS Policies:**
- `articles`: publik SELECT hanya `status = 'published'`; admin (authorized) semua operasi
- `categories`, `authors`, `article_categories`: publik SELECT; admin semua operasi
- Tidak boleh equate authentication dengan authorization — ada validasi eksplisit bahwa user adalah admin yang diotorisasi, bukan sekadar authenticated

**Publication visibility rule (satu aturan konsisten):**
- Artikel dengan `status != 'published'` tidak boleh muncul di: public listings, article detail pages, related articles, sitemap, RSS feed
- Draft preview hanya accessible oleh admin yang terotorisasi, bukan publik
- Tidak ada scheduled publishing untuk MVP — `published_at` adalah editorial metadata saja

---

## Authorization Model

> Autentikasi ≠ Otorisasi. Jangan asumsikan bahwa user yang sudah login otomatis bisa melakukan semua operasi admin.

- Admin accounts diidentifikasi secara eksplisit (misalnya via kolom `role` di Supabase `auth.users` metadata, atau tabel whitelist terpisah)
- Semua mutasi artikel, kategori, author profile, dan storage di-enforce server-side
- RLS dan Storage policies dikonfigurasi untuk menolak write dari user yang authenticated tapi tidak authorized
- Test wajib: authenticated user tanpa admin role tidak bisa insert/update/delete artikel atau kategori
- Service-role credentials tidak boleh terekspos di client bundle atau committed ke source control

---

## Arsitektur Aplikasi

```
varasa/
├── app/
│   ├── (public)/                    # Website publik
│   │   ├── page.tsx                 # Homepage
│   │   ├── articles/
│   │   │   ├── page.tsx             # Listing semua artikel + pagination
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Halaman artikel detail
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Halaman kategori + pagination
│   │   ├── author/
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Halaman profil penulis publik
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx             # Informational only (email/link, no contact form)
│   │   ├── privacy-policy/
│   │   │   └── page.tsx
│   │   └── editorial-policy/
│   │       └── page.tsx
│   ├── admin/                       # Admin dashboard (protected)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── page.tsx                 # Dashboard overview
│   │   ├── articles/
│   │   │   ├── page.tsx             # List artikel
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Buat artikel baru
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx     # Edit artikel
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx             # Author profile editor
│   ├── feed.xml/
│   │   └── route.ts                 # RSS 2.0 feed
│   ├── sitemap.ts                   # Dynamic sitemap
│   ├── robots.ts                    # robots.txt
│   └── api/
│       └── upload/
│           └── route.ts             # Image upload endpoint (admin only)
├── components/
│   ├── public/
│   │   ├── ArticleCard.tsx
│   │   ├── FeaturedArticle.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── ArticleRenderer.tsx      # Safe Tiptap JSON renderer
│   │   └── AdSlot.tsx
│   └── admin/
│       ├── Editor.tsx               # Novel.js / Tiptap wrapper
│       ├── ImageUpload.tsx
│       └── ArticleForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── content/
│   │   └── renderer.ts              # Tiptap JSON → safe HTML renderer
│   └── utils/
│       └── slug.ts
├── supabase/
│   └── migrations/                  # Version-controlled SQL migrations
│       ├── 001_create_authors.sql
│       ├── 002_create_categories.sql
│       ├── 003_create_articles.sql
│       ├── 004_create_article_categories.sql
│       └── 005_rls_policies.sql
└── notes/
    ├── req-kiro.md
    ├── req-user.md
    └── uiux-scope.md
```

---

## CMS Requirements (Admin Dashboard)

### Autentikasi & Otorisasi Admin
- Email + password via Supabase Auth
- Session via cookie menggunakan `@supabase/ssr`, privileged credentials server-side only
- Middleware proteksi semua route `/admin/*` kecuali `/admin/login`
- **Authorization check eksplisit**: verified admin role, bukan sekadar authenticated
- Tombol logout

### Manajemen Artikel
- CRUD artikel lengkap
- Status: `draft` dan `published`
- Slug: auto-generate dari judul, bisa diedit manual, validasi unik
- Rich-text editor: Novel.js atau Tiptap (tergantung compatibility check)
  - Supported nodes: paragraph, heading H2-H3, bullet list, ordered list, blockquote, horizontal rule, image
  - Supported marks: bold, italic, link
  - Slash commands jika tersedia secara reliable — bukan MVP blocker
- Cover image upload ke Supabase Storage
- Fields SEO: seo_title, meta_description
- `published_at` dapat diedit manual (editorial metadata)
  - Di-set otomatis saat pertama kali publish jika null
  - Dipreserve saat edit artikel yang sudah published
  - Tidak ada scheduled publishing
- Preview artikel sebelum publish (hanya accessible admin)
- Unpublish artikel (kembali ke draft)
- Konfirmasi sebelum destructive actions
- Loading, success, validation, dan error states yang useful

### Manajemen Kategori
- CRUD kategori
- Slug auto-generate dari nama, bisa diedit manual
- Deskripsi kategori
- Konfirmasi sebelum hapus

### Image Upload
- Bucket: `varasa-media` di Supabase Storage
- Validasi: MIME type (image/jpeg, image/png, image/webp), ukuran max 2MB
- Upload hanya oleh admin yang terotorisasi
- Public read policy hanya untuk assets yang ditujukan untuk published content
- Support cover image replacement
- Never expose service-role credentials di client code

### Admin Settings (`/admin/settings`)
- Editor profil penulis: nama, slug, bio, avatar URL
- Scope minimal — tidak ada site settings, theme config, ad management, atau multi-author
- Konfigurasi teknis tetap di environment variables

---

## Content Rendering

> Gunakan custom renderer yang aman — jangan render arbitrary HTML.

- Build dedicated renderer untuk supported Tiptap JSON schema (`lib/content/renderer.ts`)
- Render hanya node dan mark types yang diapprove: paragraph, heading, bullet list, ordered list, blockquote, horizontal rule, image, bold, italic, link
- Validasi link protocols — only `http://`, `https://`, `mailto:`. Tambahkan `rel="noopener noreferrer"` pada external links
- Handle empty atau malformed content gracefully (fallback ke empty state, tidak crash)
- Gunakan rendering rules yang sama untuk public articles dan admin preview
- Jangan inject arbitrary HTML atau unsafe URLs

---

## Website Publik Requirements

### Homepage (Magazine-style)
- Featured article (hero besar)
- Grid latest articles (thumbnail, judul, kategori, tanggal, excerpt)
- Section per kategori
- Navigasi: logo Varasa, link kategori utama
- Responsive: 1 kolom mobile, 2 kolom tablet, 3 kolom desktop

### Halaman Article Listing (`/articles`)
- Article cards dengan image, kategori, judul, excerpt, author, tanggal
- Pagination

### Halaman Artikel (`/articles/[slug]`)
- Judul, excerpt, penulis, tanggal publikasi
- Cover image (`next/image`)
- Table of Contents dari H2-H3, highlight saat scroll
- Konten utama via safe renderer
- Slot iklan AdSense (reserved placement, tidak require live integration)
- Artikel terkait: 3 artikel dari kategori yang sama
- Metadata lengkap: title, description, og:image, og:type article, canonical URL
- JSON-LD structured data (BlogPosting schema)
- Draft atau unpublished → 404

### Halaman Kategori (`/categories/[slug]`)
- Nama dan deskripsi kategori
- Published articles dalam kategori + pagination

### Halaman Author (`/author/[slug]`)
- Profil penulis: nama, bio, foto
- Published articles oleh penulis

### Halaman Statis
- `/about` — Tentang Varasa
- `/contact` — Informational only: email atau external contact link. Tidak ada contact form kecuali diapprove eksplisit
- `/privacy-policy` — Kebijakan privasi
- `/editorial-policy` — Kebijakan editorial

### Navigasi & Footer
- Breadcrumb di halaman artikel
- Footer dengan link kategori, about, dan halaman statis

---

## SEO, RSS & Performance

- `app/sitemap.ts`: sitemap XML dinamis, published articles + kategori only. Tidak include drafts.
- `app/robots.ts`: allow semua crawler, disallow `/admin`
- `app/feed.xml/route.ts`: RSS 2.0 — published articles only, absolute URLs, title, excerpt, published_at, author. Reflect publish/unpublish, tidak expose drafts.
- Global metadata: title template `%s | Varasa`, default og:image
- Semua gambar: `next/image` dengan width, height, alt
- Google Fonts via `next/font`
- AdSense script: `next/script` dengan `strategy="lazyOnload"` — tidak blocking LCP
- Prefer Server Components untuk public pages
- Cache invalidation setelah publish, edit, atau unpublish
- Target Lighthouse Performance: > 90

---

## Pre-Implementation Checklist

> Sebelum coding dimulai, laporkan hal berikut untuk approval:

1. **Planned dependencies** — daftar lengkap packages beserta versi
2. **Migration structure** — daftar file migration SQL
3. **Authorization approach** — bagaimana admin role diverifikasi
4. **Implementation checklist** — urutan implementasi per task

---

## Task Roadmap (13 Tasks)

| Task | Deskripsi | Minggu |
|---|---|---|
| Task 1 | Project setup + Supabase foundation + .env.example | 1 |
| Task 2 | Database migrations + RLS + Storage policies + Authorization model | 1 |
| Task 3 | Admin authentication + authorization | 1 |
| Task 4 | Design system + Admin layout (shadcn/ui) | 2 |
| Task 5 | Rich-text editor (Novel.js compat check → Tiptap) + safe renderer | 2 |
| Task 6 | Image upload ke Supabase Storage | 2 |
| Task 7 | CRUD artikel + draft/publish workflow + admin settings | 2 |
| Task 8 | Manajemen kategori (admin) | 2 |
| Task 9 | Website publik — Homepage + article listing | 3 |
| Task 10 | Website publik — Halaman artikel + ToC + related articles | 3 |
| Task 11 | Halaman kategori, author, halaman statis, navigasi, footer | 3 |
| Task 12 | SEO technical (sitemap, robots, metadata, RSS, structured data) | 4 |
| Task 13 | Performance, AdSense slots, acceptance testing, final checks | 4 |

---

## Confirmed Implementation Decisions

> Keputusan final. Tidak boleh diperluas tanpa persetujuan eksplisit.

1. **Article categories:** Many-to-many via `article_categories`. Satu artikel bisa masuk beberapa kategori. Tags dan nested categories out of scope MVP.

2. **`/admin/settings`:** Minimal author profile editor — nama, slug, bio, avatar URL. Tidak ada global site settings, theme config, ad management, atau multi-author admin.

3. **RSS feed:** Masuk MVP. `/feed.xml` — RSS 2.0, published articles only, absolute URLs, title, excerpt, published_at, author.

4. **Published_at:** Editorial metadata yang bisa diedit manual. Tidak ada scheduled publishing. Di-set otomatis saat pertama publish jika null, dipreserve saat edit artikel published.

5. **Contact page:** Informational only — email atau external link. Tidak ada contact form kecuali diapprove eksplisit.

6. **Analytics:** Vercel Analytics opsional, bukan MVP requirement.

7. **AdSense:** Prepare placement components. Tidak require live integration atau account approval.

8. **Novel.js:** Verify compatibility sebelum integrasi. Fallback ke Tiptap langsung jika tidak kompatibel. JSON format tidak berubah.

---

## Acceptance Criteria (MVP Complete)

MVP dinyatakan selesai hanya jika semua kriteria berikut terverifikasi:

1. Project install, build, dan TypeScript strict check lulus
2. Admin authorized bisa login dan akses dashboard
3. Authenticated tapi unauthorized user tidak bisa write data (artikel, kategori, storage)
4. Admin bisa create, edit, save draft, preview, publish, dan unpublish artikel
5. Draft tidak pernah muncul di halaman publik, sitemap, atau RSS feed
6. Draft preview tidak accessible oleh publik
7. Artikel published ter-render dari Tiptap JSON dengan safe renderer
8. Slug artikel unik dan URL berfungsi
9. Kategori bisa dibuat dan di-assign ke artikel (many-to-many)
10. Upload cover image dan gambar inline berfungsi sesuai access rules
11. SEO metadata dan canonical URL ter-generate dengan benar
12. Sitemap, robots.txt, dan RSS feed berfungsi dan tidak expose drafts
13. Halaman publik responsive dan keyboard-accessible
14. Publish dan unpublish invalidate cache yang sesuai
15. Error states dan validasi ditangani tanpa data loss
16. Tidak ada credentials yang terekspos di client bundle atau committed files

---

*Dibuat oleh: Kiro Planning Agent — reconciled dengan req-user.md, uiux-scope.md, dan pre-implementation corrections*  
*Tanggal: Oktober 2026*
