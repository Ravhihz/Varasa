### UI/UX Scope — Varasa MVP

**Approved stack**
- Next.js App Router + TypeScript
- Tailwind CSS
- shadcn/ui for reusable interface components
- Lucide for icons
- Motion for React for selective animations
- Novel.js for the rich-text editor, with direct Tiptap integration as the fallback

React Bits is optional inspiration only. Do not add another UI or animation library without explicit approval.

**Public website**
Implement a modern editorial magazine design focused on readability and content discovery. Include the homepage, article listing, article detail, category pages, author profile, about, contact, privacy policy, and editorial policy.

**Admin dashboard**
Use shadcn/ui for login forms, dashboard layout, sidebar, tables, dialogs, forms, dropdowns, badges, toast notifications, skeletons, and empty/error states. Include article CRUD, category management, editor, preview, and single-author profile settings.

**Design system**
Define typography, colors, spacing, container widths, breakpoints, image ratios, borders, radius, shadows, and component variants before implementing every page. Keep shared design decisions centralized and consistent.

**Animation policy**
Prefer CSS transitions for basic hover and focus effects. Use Motion only for interactions that benefit from it, such as mobile navigation, drawers, selected entrance transitions, or coordinated layout changes. Respect reduced-motion preferences and do not delay content or user interactions.

**Strict scope boundaries**
- Do not add UI libraries without approval.
- Do not animate every card or component.
- Do not duplicate existing shadcn/ui components without a functional reason.
- Do not redesign approved screens merely because a different visual style looks more attractive.
- Do not introduce decorative complexity that harms performance, accessibility, or reading comfort.

**Acceptance**
All public pages and admin screens must be responsive, keyboard-accessible, consistent, and equipped with appropriate loading, empty, success, and error states. Complete one visual refinement pass after the functional MVP is ready, then freeze the design.

Only revisit the frozen design for verified bugs, accessibility issues, responsive failures, usability problems, or measurable performance concerns.