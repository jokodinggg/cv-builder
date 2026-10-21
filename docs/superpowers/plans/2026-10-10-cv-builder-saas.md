# CV Builder SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Multi-user CV builder SaaS with auth, multi-CV management, reorderable sections/items/links, paginated live preview, Puppeteer PDF export, and ID⇄EN translation.

**Architecture:** Next.js 16 App Router app. CV content is one Zod-validated JSON document per `Resume` row. Pure modules (schema, links, blocks, paginate, translate) carry the logic and the unit tests; React components render the same `CvPage` for preview and print so the PDF equals the preview.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Prisma 6 + PostgreSQL, Better Auth 1.x, Zod 4, @dnd-kit, immer, puppeteer-core, @anthropic-ai/sdk, Vitest 3.

**Spec:** `docs/superpowers/specs/2026-10-10-cv-builder-saas-design.md`

## Global Constraints

- Node 20 (installed v20.20.2) — Vitest pinned to 3.x because Vitest 5 needs Node 22.
- Package manager: pnpm.
- Not-found and not-owned both return 404.
- Field caps: 5 000 chars per string, 50 items per section, 30 sections, 20 links.
- Link hrefs only `http:`, `https:`, `mailto:`, `tel:`.
- A4 sheet 210×297 mm; content margins 16 mm top/bottom, 18 mm left/right.
- Autosave debounce 800 ms.
- PDF filename `CV_<Full Name>_<MON><YY>.pdf` (e.g. `CV_Budi Santoso_OCT26.pdf`).
- Translation copy title suffix ` (EN)` / ` (ID)`.
- UI copy in Indonesian; CV default section titles follow CV language.

## Review Focus

- Empty CV (no visible sections, empty name) — preview renders one blank sheet, PDF still exports.
- Single item taller than one page — placed alone, no infinite loop, flagged `overflow`.
- Translation provider returns wrong number of strings — whole translation aborts, nothing saved.
- Malformed `content` JSON in DB — editor loads with parsed/blank fallback, no crash.
- `javascript:` link value — rendered as plain text, never as href.

---

### Task 1: Scaffold app, move legacy, DB + auth

**Files:**
- Move: `index.html`, `script.js`, `style.css` → `legacy/`
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.env.example`, `.gitignore`
- Create: `prisma/schema.prisma` (Better Auth tables + `Resume` from spec §3)
- Create: `src/lib/db.ts`, `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/session.ts`, `src/app/api/auth/[...all]/route.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/proxy.ts`

**Interfaces:**
- Produces: `prisma` (PrismaClient singleton); `auth` (Better Auth instance); `authClient` with `signIn.email`, `signUp.email`, `signOut`, `signIn.social`; `requireUser(): Promise<{ id: string; name: string; email: string }>` (redirects to `/login` when no session); `getUser(): Promise<User | null>`.

- [ ] Step 1: `pnpm add` runtime deps and `pnpm add -D` dev deps; scripts `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `db:migrate`, `db:seed`.
- [ ] Step 2: Prisma schema; `createdb cv_builder`; `pnpm prisma migrate dev --name init`. Expected: migration applied.
- [ ] Step 3: Better Auth with `prismaAdapter(prisma, { provider: "postgresql" })`, `emailAndPassword.enabled`, Google only when `GOOGLE_CLIENT_ID` set, `nextCookies()` plugin.
- [ ] Step 4: `proxy.ts` redirects `/dashboard` and `/cv/*` to `/login` when no session cookie (optimistic check; pages still call `requireUser`).
- [ ] Step 5: Login/register pages; landing page with CTA.
- [ ] Step 6: `pnpm typecheck && pnpm build`. Expected: success. Commit `feat: scaffold Next.js SaaS with auth and database`.

### Task 2: Resume schema, defaults, links

**Files:**
- Create: `src/lib/resume/schema.ts`, `src/lib/resume/defaults.ts`, `src/lib/resume/links.ts`, `src/lib/resume/ids.ts`
- Test: `src/lib/resume/schema.test.ts`, `src/lib/resume/links.test.ts`

**Interfaces:**
- Produces:
  - Types `ResumeContent`, `Section`, `SectionType`, `Item`, `Link`, `LinkType`, `Language = "id" | "en"`.
  - `resumeContentSchema` (Zod); `parseContent(raw: unknown): ResumeContent` (returns blank content on failure).
  - `createBlankContent(language: Language): ResumeContent`; `createSection(type, language): Section`; `createItem(type, language): Item`; `defaultSectionTitle(type, language): string`; `sectionTitle(section, language): string`; `FIELD_CONFIG: Record<SectionType, { title?: string; subtitle?: string; date?: string; detail?: string; bullets?: string }>` (label per field, Indonesian; field absent = hidden).
  - `newId(): string`; `withFreshIds(content: ResumeContent): ResumeContent`.
  - `LINK_TYPES: Record<LinkType, { label: string; placeholder: string }>`; `linkHref(link: Link): string | null`; `linkDisplay(link: Link): string`.

- [ ] Step 1: Tests:
  - `parseContent(createBlankContent("id"))` round-trips; blank has sections in order `education, skills, experience, projects, achievements`.
  - schema rejects string longer than 5 000; rejects 51 items.
  - `parseContent({ garbage: true })` returns a blank content (not throws).
  - `withFreshIds` changes every section/item/link id, keeps text.
  - `linkHref({type:"whatsapp", value:"0812-3456-7890"})` → `https://wa.me/6281234567890`; `+6281…` → same digits without `+`.
  - `linkHref({type:"linkedin", value:"linkedin.com/in/budisantoso"})` → `https://linkedin.com/in/budisantoso`; `linkDisplay` strips `https://` and `www.`.
  - `linkHref({type:"email", value:"a@b.co"})` → `mailto:a@b.co`.
  - `linkHref({type:"website", value:"javascript:alert(1)"})` → `null`.
- [ ] Step 2: Run `pnpm test` — FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: `pnpm test` — PASS. Commit `feat: add resume content schema and link helpers`.

### Task 3: Blocks + pagination (pure)

**Files:**
- Create: `src/lib/resume/blocks.ts`, `src/lib/resume/paginate.ts`
- Test: `src/lib/resume/blocks.test.ts`, `src/lib/resume/paginate.test.ts`

**Interfaces:**
- Produces:
  - `type Block = { key: string; kind: "header" | "section-start" | "item"; sectionId?: string; itemId?: string; breakBefore?: boolean }`. `section-start` = section heading + first visible item rendered together.
  - `buildBlocks(content: ResumeContent): Block[]` — skips hidden sections, hidden items, and sections with zero visible items (summary uses its single item).
  - `paginate(heights: number[], breakBefore: boolean[], pageHeight: number): { pages: number[][]; overflow: number[] }` — returns block indexes per page.

- [ ] Step 1: Tests:
  - blocks: header first; section with 3 items → 1 `section-start` + 2 `item`; hidden section skipped; hidden item skipped; order follows `sections` array; `pageBreakBefore` propagates to `section-start.breakBefore`.
  - paginate: `[100,100,100]`, page 250 → `[[0,1],[2]]`; forced break on index 1 with room → `[[0],[1,2]]`; forced break on index 0 does not create an empty first page; block of 400 on page 250 → alone on its page and listed in `overflow`; empty heights → `[[]]`.
- [ ] Step 2: FAIL. Step 3: implement greedy packing. Step 4: PASS. Commit `feat: add CV block model and page packing`.

### Task 4: Repository, server actions, dashboard

**Files:**
- Create: `src/lib/resume/repository.ts`, `src/actions/resume.ts`, `src/app/dashboard/page.tsx`, `src/components/dashboard/*`
- Test: `src/lib/resume/repository.test.ts` (uses `DATABASE_URL` test DB; skipped when unset)

**Interfaces:**
- Produces repository (all take `userId` first, never return other users' rows):
  - `listResumes(userId): Promise<ResumeSummary[]>` (`{id,title,language,updatedAt}`)
  - `getResume(userId, id): Promise<ResumeRecord | null>` (`{id,title,language,template,content: ResumeContent,updatedAt}`)
  - `createResume(userId, { title, language, content }): Promise<ResumeRecord>`
  - `updateResume(userId, id, patch: { title?, language?, content? }): Promise<boolean>`
  - `deleteResume(userId, id): Promise<boolean>`
- Server actions (each calls `requireUser`): `createResumeAction(formData)` (fields `title`, `language`, `sourceId` optional → duplicate with `withFreshIds`) redirects to `/cv/:id`; `saveResumeAction(id, content)` → `{ ok: true, updatedAt } | { ok: false, error }`; `renameResumeAction(id, title)`; `deleteResumeAction(id)`; `duplicateResumeAction(id)`.

- [ ] Step 1: Ownership test: user A creates; user B `getResume` → null, `updateResume` → false, `deleteResume` → false; A still reads it.
- [ ] Step 2: FAIL → implement → PASS.
- [ ] Step 3: Dashboard: card grid (title, language badge, updated time), "CV baru" dialog (title, language, start from Blank or existing CV), per-card menu: open, duplicate, rename, translate, delete (confirm).
- [ ] Step 4: Seed script `prisma/seed.ts` creates `demo@cvbuilder.local` / `demo12345` with the three legacy profiles as CVs.
- [ ] Step 5: typecheck + build; commit `feat: add resume repository, actions and dashboard`.

### Task 5: CV document rendering + paginated preview + print page

**Files:**
- Create: `src/components/cv/cv-blocks.tsx` (renders one Block), `src/components/cv/cv-sheet.css`, `src/components/cv/paginated-cv.tsx`, `src/components/cv/link-icon.tsx`
- Create: `src/app/cv/[id]/print/page.tsx`, `src/app/cv/[id]/print/print-client.tsx`

**Interfaces:**
- Consumes: `buildBlocks`, `paginate`, `linkHref`, `linkDisplay`, `sectionTitle`.
- Produces: `<PaginatedCv content language layout?: "stack" | "spread" zoom?: number onReady?: (pageCount) => void />` — renders hidden measure column + pages; sets `data-ready="true"` on root after fonts load and pagination is computed; re-measures on content change (ResizeObserver not needed; recompute in `useLayoutEffect` keyed on content).

- [ ] Step 1: Sheet CSS reproduces legacy look (Georgia/serif body, centered name, icon contact row, 1.5px section rules, right-aligned bold dates, italic tech). Use `mm` units for sheet & margins so screen and print match.
- [ ] Step 2: Print page: `requireUser`, `getResume` or `notFound()`, renders `PaginatedCv` stack with `@page { size: A4; margin: 0 }`, each sheet `break-after: page`, no app chrome; `?autoprint=1` calls `window.print()` when ready.
- [ ] Step 3: Manual check in browser: 2-page legacy AI profile splits cleanly. Commit `feat: render paginated CV sheets and print page`.

### Task 6: Editor

**Files:**
- Create: `src/app/cv/[id]/page.tsx`, `src/components/editor/editor-shell.tsx`, `src/components/editor/use-resume-state.ts`, `src/components/editor/sortable-list.tsx`, `src/components/editor/personal-editor.tsx`, `src/components/editor/links-editor.tsx`, `src/components/editor/section-editor.tsx`, `src/components/editor/item-editor.tsx`, `src/components/editor/add-section-menu.tsx`, `src/components/editor/preview-panel.tsx`

**Interfaces:**
- Produces: `useResumeState(initial: ResumeRecord)` → `{ content, title, update(recipe: (draft: ResumeContent) => void), setTitle, saveState: "idle"|"saving"|"saved"|"error", retry }` with 800 ms debounced `saveResumeAction`, `beforeunload` guard while dirty.
- `SortableList<T extends {id:string}>({ items, onReorder(from, to), renderItem(item, handleProps, index) })` using @dnd-kit sortable + keyboard sensor; plus up/down buttons in each row.

- [ ] Step 1: Two-column layout: editor left (scroll), preview right (sticky, own scroll). Mobile: tab switch Editor / Preview.
- [ ] Step 2: Panels: personal (name, headline), links (type select, value, visible toggle, reorder, add/remove), sections (collapsible, reorder, rename title, visible, page-break toggle, delete, add from menu incl. custom), items (fields from `FIELD_CONFIG`, reorder, visible, duplicate, delete).
- [ ] Step 3: Preview toolbar: layout stack/spread (spread = 2 sheets side by side), zoom 50–120%, page count, Download PDF, Print via browser, Translate.
- [ ] Step 4: Focus on an item scrolls preview to its block (`data-block-key`).
- [ ] Step 5: Manual check; typecheck; commit `feat: add CV editor with drag-and-drop and live preview`.

### Task 7: PDF export route

**Files:**
- Create: `src/lib/pdf/browser.ts`, `src/lib/rate-limit.ts`, `src/app/api/cv/[id]/pdf/route.ts`
- Test: `src/lib/rate-limit.test.ts`, `src/lib/pdf/filename.test.ts` (+ `src/lib/pdf/filename.ts`)

**Interfaces:**
- Produces: `pdfFileName(fullName: string, date: Date): string`; `rateLimit(key: string, limit: number, windowMs: number, now?: number): boolean`; `renderPdf(url: string, cookie: string): Promise<Uint8Array>`; `resolveChromePath(): string | null` (env `CHROME_EXECUTABLE_PATH`, then macOS/Linux standard paths).

- [ ] Step 1: Tests: `pdfFileName("Budi Santoso", new Date("2026-10-10"))` → `CV_Budi Santoso_OCT26.pdf`; strips `/\\:*?"<>|`; empty name → `CV_OCT26.pdf`. Rate limit: 10 allowed, 11th blocked, allowed again after window.
- [ ] Step 2: FAIL → implement → PASS.
- [ ] Step 3: Route: session → 401; not owned → 404; rate limit → 429; render with 30 s timeout; respond with `Content-Disposition` using RFC 5987 `filename*`. Errors → 500 JSON `{ error }`.
- [ ] Step 4: Manual: curl with session cookie returns `%PDF`. Commit `feat: export CV to PDF with headless Chrome`.

### Task 8: Translation

**Files:**
- Create: `src/lib/resume/translate.ts`, `src/lib/translate/providers.ts`, action `translateResumeAction(id, target)` in `src/actions/resume.ts`
- Test: `src/lib/resume/translate.test.ts`

**Interfaces:**
- Produces: `collectStrings(content): string[]`; `applyStrings(content, strings): ResumeContent` (throws when length differs); `translateStrings(strings, source, target): Promise<string[]>` (Claude when `ANTHROPIC_API_KEY`, else Google endpoint; empty strings pass through untouched).

- [ ] Step 1: Tests: collect/apply round-trip with identity returns equal content; ids, links, visibility untouched; wrong length throws; custom section titles included, empty titles skipped (so default title follows new language).
- [ ] Step 2: FAIL → implement → PASS.
- [ ] Step 3: Action creates new CV `"<title> (EN)"`, language target, redirects/returns id. Dashboard + editor buttons call it with pending state and error toast.
- [ ] Step 4: Commit `feat: translate CV between Indonesian and English`.

### Task 9: Docs + final verification

**Files:**
- Create: `README.md` (stack, setup, env, scripts, usage guide in Indonesian, deployment notes incl. Chrome for PDF), `Dockerfile`, `docker-compose.yml` (postgres)

- [ ] Step 1: `pnpm test && pnpm typecheck && pnpm build` all pass.
- [ ] Step 2: Run app; register 2 users; create, duplicate, reorder, 2-page preview, PDF download, translate. Fix issues.
- [ ] Step 3: Commit `docs: add setup and usage guide`.
