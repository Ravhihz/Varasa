# Varasa — Requirements Document (User)

> Dokumen ini akan diisi oleh user dengan planning mereka sendiri.
> Bandingkan dengan `req-kiro.md` untuk reconcile sebelum implementasi.

---

<!-- Paste planning kamu di sini -->
# Build Varasa — Editorial Blog Platform MVP

## 1. Objective

Build a production-minded blog platform named **Varasa**, focused on Business & Entrepreneurship, business digitalization, and Indonesian MSMEs.

The product has two surfaces:

1. A public magazine-style editorial website.
2. A custom admin CMS that lets one author create, edit, preview, publish, and unpublish articles without modifying code.

The platform should support future monetization through Google AdSense and inbound leads for Varverse.

This is a new repository. Do not assume existing application code.

## 2. Non-negotiable scope rules

- Implement the defined MVP before proposing extra features.
- Do not redesign approved UI without a concrete usability, accessibility, or performance reason.
- Do not add features outside the scope without asking first.
- Prioritize functionality, security, SEO, maintainability, and publishing workflow over visual novelty.
- Use free-tier-compatible services wherever practical.
- Do not claim that a feature works until it has been implemented and tested.
- Inspect dependency compatibility before choosing editor packages.
- Keep the implementation simple and avoid unnecessary abstractions.

## 3. Technology stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Novel.js editor, if compatible with the selected React and Next.js versions
- Tiptap directly as the fallback editor
- Tiptap JSON stored in PostgreSQL JSONB
- Vercel deployment

Use a currently supported, mutually compatible set of package versions. Verify Novel.js compatibility before integrating it. Do not force incompatible dependencies into the project.

Use the Supabase SSR-compatible authentication approach for Next.js. Keep privileged credentials server-side only.

## 4. Brand and content positioning

Varasa is an independent editorial publication about:

- Business strategy and entrepreneurship
- Business digitalization in Indonesia
- MSME growth
- Business tools and productivity
- Building and operating small businesses
- Technology that solves practical business problems

Developer and technology topics are supporting content when relevant to business readers.

Use a clear personal author identity. Keep editorial content useful independently of Varverse's commercial services.

## 5. Routes

Public:
- /
- /articles
- /articles/[slug]
- /categories/[slug]
- /author/[slug]
- /about
- /contact
- /privacy-policy
- /editorial-policy

Admin:
- /admin/login
- /admin
- /admin/articles
- /admin/articles/new
- /admin/articles/[id]/edit
- /admin/categories
- /admin/settings

Implement the defined routes without adding unrelated pages.

## 6. Database schema

Create version-controlled SQL migrations.

### authors
- id
- name
- slug
- bio
- avatar_url
- created_at

### articles
- id
- author_id
- title
- slug
- excerpt
- content_json JSONB
- cover_image
- status: draft or published
- seo_title
- meta_description
- published_at
- created_at
- updated_at

### categories
- id
- name
- slug
- description
- created_at

### article_categories
- article_id
- category_id

Requirements:
- Unique article slugs and category slugs.
- Foreign keys and explicit deletion behavior.
- Appropriate indexes for slug, publication status, and publication date.
- Validate Tiptap JSON before saving.
- Generate timestamps consistently.
- Preserve the original publication date when editing an already-published article.
- Assign a publication date when publishing a draft.
- Keep a single-author workflow for the MVP.

## 7. CMS functionality

Implement:
- Secure admin login and logout.
- Protected admin routes.
- Article list with status and publication date.
- Create, edit, save draft, preview, publish, and unpublish actions.
- Category CRUD.
- Editable title, slug, excerpt, body, cover image, category, SEO title, and meta description.
- Slug generation from the title, with manual editing and uniqueness validation.
- Upload and replace article cover images.
- Insert images into article content.
- Preview the rendered article before publication.
- Useful loading, success, validation, and error states.
- Confirmation before destructive actions.

Use a Tiptap-compatible JSON document as the canonical content representation. Do not store arbitrary raw HTML as the main content format.

The editor should support:
- Paragraphs
- Heading levels 2 and 3
- Bold and italic
- Ordered and unordered lists
- Blockquotes
- Links
- Images
- Horizontal rules

Add slash commands if they are supported reliably by the selected editor version. Slash commands are not a blocker for the MVP.

## 8. Article rendering

Build a dedicated renderer for the supported Tiptap JSON schema.

Requirements:
- Render content safely without executing arbitrary HTML.
- Generate a table of contents from article headings.
- Provide stable heading IDs.
- Support responsive images, lists, quotes, and links.
- Handle empty or malformed content gracefully.
- Use the same rendering rules for public articles and previews.
- Validate external links and apply appropriate safe link attributes.

## 9. Supabase Storage

Create a dedicated storage bucket for article images.

Requirements:
- Validate MIME type and file size.
- Generate collision-resistant storage paths.
- Restrict uploads to authorized admins.
- Allow public reading only for assets intended for published content.
- Support cover image replacement and cleanup of obsolete files when safe.
- Never expose service-role credentials in client code.
- Configure Next.js image handling for the selected image host.

## 10. Public website UI

Use a magazine-style editorial design with a modern, restrained visual system.

Homepage:
- Header and navigation
- Featured article
- Latest articles
- Category sections
- Selected articles
- Footer

Article listing:
- Article cards with image, category, title, excerpt, author, and date
- Pagination

Article detail:
- Title
- Excerpt
- Author identity
- Publication date
- Cover image
- Table of contents
- Article body
- Related articles
- Reserved ad placement
- Relevant Varverse CTA where appropriate

Category page:
- Category name and description
- Published articles in that category
- Pagination

Author page:
- Author profile and published articles

Other pages:
- About
- Contact
- Privacy policy
- Editorial policy

Visual requirements:
- Responsive on mobile, tablet, and desktop.
- Accessible contrast, keyboard navigation, visible focus states, and semantic HTML.
- Consistent typography, spacing, and image ratios.
- Minimal decorative animation.
- Avoid excessive gradients, glass effects, and unnecessary UI complexity.
- No redesign loop after acceptance unless a concrete issue is found.

## 11. SEO and discoverability

Implement:
- Dynamic title and meta description.
- Canonical URLs.
- Open Graph metadata.
- Article metadata and appropriate structured data.
- XML sitemap including published articles and public categories.
- robots.txt.
- Semantic heading hierarchy.
- Indexable pagination and category pages.
- RSS feed if it can be implemented without compromising core scope.
- Noindex and no public exposure for draft content.

Only published content should appear in public article listings, related articles, public queries, and the sitemap.

## 12. Security

- Use Supabase Auth.
- Enforce authorization on the server.
- Protect all admin mutations.
- Configure RLS for all relevant tables.
- Deny anonymous writes and privileged operations.
- Keep service-role keys server-only.
- Validate and sanitize all untrusted inputs.
- Restrict uploads by file type and size.
- Do not rely on UI hiding as an authorization mechanism.
- Ensure draft previews cannot be accessed by unauthorized users.
- Never commit secrets to source control.

## 13. Caching and data consistency

- Prefer Server Components for public pages.
- Use Client Components only when interactivity requires them.
- Revalidate affected pages and sitemap after publish, edit, or unpublish operations.
- Prevent stale published content from persisting after unpublishing.
- Handle database and storage failures gracefully.

## 14. Monetization

Prepare unobtrusive ad-placement components in suitable locations, but do not build an ad-management system.

Do not assume AdSense approval. Keep the site usable before ad integration.

Provide a relevant inbound-lead CTA without turning every article into a sales page.

## 15. Required environment configuration

Provide a `.env.example` containing placeholders for the required Supabase and site URL configuration.

Never insert real credentials into source control. Validate required environment variables and document how to configure them locally and in Vercel.

## 16. Testing and acceptance criteria

The MVP is complete only when all of the following are verified:

1. The project installs, builds, and passes TypeScript checks.
2. An authorized admin can log in and access the dashboard.
3. An unauthorized visitor cannot access admin pages or mutate content.
4. An admin can create, edit, save, preview, publish, and unpublish an article.
5. A draft never appears on public pages or in the sitemap.
6. Published articles render from Tiptap JSON correctly.
7. Article slugs are unique and URLs work.
8. Categories can be created and assigned to articles.
9. Cover and in-content image uploads work under the defined access rules.
10. SEO metadata and canonical URLs are generated correctly.
11. Sitemap and robots.txt work.
12. Public pages are responsive and keyboard-accessible.
13. Publishing and unpublishing invalidate the appropriate caches.
14. Error states and validation are handled without data loss.
15. No secret credentials are exposed in client bundles or committed files.

Run lint, type-check, build, and relevant automated tests. Report any checks that could not be run rather than claiming they passed.

<!-- ## 17. Implementation sequence

Phase 1: Initialize project, configure dependencies, environment variables, and design tokens.

Phase 2: Create SQL migrations, database types, Supabase clients, RLS policies, and storage policies.

Phase 3: Build public pages using representative content and establish the frozen design system.

Phase 4: Implement authentication and protected admin routes.

Phase 5: Implement article/category CRUD, editor, image uploads, draft preview, and publishing workflow.

Phase 6: Implement SEO, sitemap, robots.txt, structured data, and cache invalidation.

Phase 7: Test security, publishing workflow, responsive behavior, accessibility, and production build.

Phase 8: Document local setup, migrations, Supabase configuration, deployment, and known limitations.

Start by inspecting package compatibility and presenting a concise implementation checklist. Then implement the phases in sequence. Do not replace the implementation with mockups or a purely visual prototype. -->