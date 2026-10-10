# CV Builder SaaS — Design Spec

Date: 2026-10-10
Status: approved via `/goal` directive (owner asked to proceed without pausing)

## 1. Intent

Turn the current single-user static CV builder (`index.html` + `script.js` + localStorage) into a
multi-user SaaS. Each person signs in, owns many CVs, and edits them with a live, paginated A4
preview that matches the exported PDF exactly.

### What the owner asked for

- SaaS with per-person login.
- Users create their own CVs: start blank, or copy an earlier CV.
- Full editing like the current tool: skills, experience, projects, achievements, education.
- Reorder everything: sections, items inside a section, and social/contact links.
- Social links ("medsos") are configurable.
- Live preview beside the editor, and the CV can span 2 pages ("2 kertas").
- Better PDF export.
- Language conversion (Indonesian ⇄ English).
- Clear tech stack and usage documentation.

### Assumptions (owner did not specify; defaults chosen)

- UI language: Indonesian first, CV content language per CV (`id` or `en`).
- Auth: email + password always; Google OAuth enabled when env vars are present.
- No billing in this iteration (free tier). Data model leaves room for plans later.
- One visual template (the current serif layout seen in `CV-list/*.pdf`). Template field exists
  in the data model so more templates can be added later.
- Translation creates a **new copy** in the target language. The original stays untouched.

### Success criteria

1. Two different users each see only their own CVs (verified by an ownership test).
2. A user can create blank, duplicate, rename, delete, and translate a CV.
3. Sections, items, and links reorder by drag and drop and by up/down buttons.
4. Preview splits content across A4 pages automatically; 2-page CVs show as two sheets,
   side by side on wide screens.
5. Downloaded PDF is pixel-identical in layout to the preview (same component, same pagination),
   with real text (selectable), correct file name, and no clipped items.
6. Translate ID→EN keeps technical terms (React, PostgreSQL, YOLOv11) unchanged.
7. `pnpm test`, `pnpm typecheck`, `pnpm build` pass.

## 2. Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | One codebase for UI, server actions, API routes |
| Styling | Tailwind CSS 4 | Fast, consistent UI; CV sheet uses plain CSS for print fidelity |
| Database | PostgreSQL + Prisma 6 | Relational auth tables + JSON column for CV content |
| Auth | Better Auth 1.x (email/password, optional Google) | Self-hosted, Prisma adapter, session cookies |
| Validation | Zod 4 | One schema for client, server actions, and DB JSON |
| Drag and drop | @dnd-kit (core + sortable) | Accessible keyboard + pointer sorting |
| PDF | puppeteer-core driving installed Chrome/Chromium | Renders the same print page as the preview; real text PDF |
| Translation | Claude API when `ANTHROPIC_API_KEY` is set; Google public endpoint fallback | Claude keeps tech terms and tone; fallback keeps feature usable without a key |
| Tests | Vitest (unit), Playwright not required in this iteration | Pure logic is the risky part |

## 3. Architecture

```
src/
  app/
    (marketing)/page.tsx          landing page
    (auth)/login, register        auth pages
    dashboard/page.tsx            CV list: new, duplicate, rename, delete, translate
    cv/[id]/page.tsx              editor + live preview (server loads, client edits)
    cv/[id]/print/page.tsx        print-only page used by PDF export and browser print
    api/auth/[...all]/route.ts    Better Auth handler
    api/cv/[id]/pdf/route.ts      PDF export (puppeteer)
  lib/
    auth.ts, auth-client.ts       Better Auth server + client
    db.ts                         Prisma singleton
    session.ts                    requireUser() helper
    resume/schema.ts              Zod schema + types for CV content
    resume/defaults.ts            blank CV + section templates + labels (id/en)
    resume/links.ts               link type metadata, href + display normalization
    resume/blocks.ts              flatten CV into measurable blocks (pure)
    resume/paginate.ts            pack measured blocks into pages (pure)
    resume/translate.ts           collect/apply translatable strings (pure) + providers
    resume/repository.ts          DB access with ownership checks
  actions/resume.ts               server actions: create, duplicate, save, rename, delete, translate
  components/
    editor/*                      form panels, sortable lists, link editor, section editor
    preview/*                     CvDocument (pages), PaginatedPreview, sheet styles
```

### Data model

```prisma
model Resume {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  language  String   @default("id")   // "id" | "en"
  template  String   @default("classic")
  content   Json                         // ResumeContent, validated by Zod on read and write
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId, updatedAt])
}
```

Plus Better Auth tables: `User`, `Session`, `Account`, `Verification`.

### CV content (`ResumeContent`, schemaVersion 1)

```ts
{
  schemaVersion: 1,
  personal: { fullName: string, headline: string },
  links: Array<{ id, type: LinkType, value: string, visible: boolean }>,
  sections: Array<{
    id, type: "summary" | "education" | "skills" | "experience" | "projects" | "achievements" | "custom",
    title: string,              // empty = default title in CV language
    visible: boolean,
    pageBreakBefore: boolean,   // manual "start on new page"
    items: Array<{ id, title, subtitle, date, detail, bullets, visible }>
  }>
}
```

`LinkType` = email, phone, whatsapp, linkedin, github, website, instagram, x, youtube, other.
Each type has an icon, a placeholder, and an href builder (e.g. WhatsApp number → `https://wa.me/62…`).

Item fields are generic. Each section type maps them to labels and rendering:

| Section | title | subtitle | date | detail | bullets |
| --- | --- | --- | --- | --- | --- |
| experience / custom | Role | Company | Period | — | Achievements (one per line) |
| projects | Project name | Link (optional) | Period (optional) | Tech stack (italic) | Description lines |
| education | Institution / degree | — | Years | Note (italic) | — |
| skills | Category | — | — | Skill list | — |
| achievements | Achievement | — | — | — | — |
| summary | — | — | — | Paragraph | — |

## 4. Key flows

### Editing and autosave
Client keeps `ResumeContent` in state (immer updates). Every change re-renders the preview
immediately. A debounced (800 ms) server action `saveResume(id, content)` validates with Zod,
checks ownership, and writes. Status chip shows Saving / Saved / Error with retry.
`beforeunload` warns when a save is pending.

### Pagination (preview == PDF)
1. `blocks.ts` turns content into ordered blocks: header block, then per section a heading block
   glued to its first item, then one block per item.
2. `PaginatedPreview` renders all blocks once in a hidden measuring column with the exact sheet
   width and fonts, reads each block's height (after `document.fonts.ready`).
3. `paginate.ts` packs blocks into pages with a fixed content height (A4 minus margins).
   Rules: a heading never ends a page; `pageBreakBefore` forces a new page; an item taller than
   a page is placed alone and allowed to overflow (flagged in UI).
4. Pages render as separate 210×297 mm sheets. View modes: single column or 2-up side by side,
   plus zoom.
5. The print page uses the same component, then sets `data-ready="true"`. Puppeteer waits for it
   and prints with `@page { size: A4; margin: 0 }` and one sheet per page.

### PDF export
`GET /api/cv/:id/pdf` → requires session, checks ownership, launches Chrome via puppeteer-core,
forwards the request cookies, opens `/cv/:id/print`, waits for `[data-ready="true"]`, returns
`application/pdf` with `Content-Disposition: attachment; filename="CV_<Name>_<MON><YY>.pdf"`.
Fallback button "Print via browser" opens the print page and calls `window.print()`; it works
when Chrome is not available on the server.

### Translation
`translateResume(id, target)` server action: collects every translatable string (titles,
headline, item text, bullets; not links, not dates' digits), sends them as a JSON array to the
provider, validates the response length matches, applies them to a deep copy, saves as a new CV
titled `<title> (EN)` / `(ID)` with `language = target`. Claude prompt instructs: keep
proper nouns, product names, and technical terms; keep line breaks; return JSON array only.
Fallback provider: Google `translate_a/single` per string with concurrency limit.

### Create / duplicate
Dashboard "New CV" dialog: name + start from (Blank, or any existing CV to copy) + language.
Blank CV contains default sections in order: education, skills, experience, projects,
achievements, each with one example item the user can overwrite. Duplicate copies content and
regenerates all ids.

## 5. Security

- Every action and route resolves the session server-side and filters by `userId`.
  Not-found and not-owned both return 404 (no existence leak).
- Zod validates all content; string length caps (e.g. 5 000 chars per field, 50 items per
  section, 30 sections) stop abuse.
- CV text renders as React text (no `dangerouslySetInnerHTML`).
- Link hrefs allow only `http(s):`, `mailto:`, `tel:` schemes.
- PDF route rate-limited per user (in-memory token bucket, 10/min) and has a 30 s timeout.
- Better Auth handles password hashing, CSRF on its endpoints, and secure cookies.

## 6. Error handling

- Save failure: status chip turns red, keeps local state, retries on next change or button.
- PDF failure (no Chrome, timeout): JSON error → UI toast suggests "Print via browser".
- Translation failure: no partial writes; toast with message.
- Invalid stored JSON: repository parses with Zod; on failure falls back to migration/blank
  content and logs, instead of crashing the page.

## 7. Testing

Vitest unit tests:
- `schema`: accepts valid content, rejects bad link schemes and oversized input.
- `links`: href + display normalization for each type.
- `blocks`: heading glued to first item, hidden sections/items skipped, order respected.
- `paginate`: fits, overflow, forced breaks, heading-never-last, oversized item.
- `translate`: collect/apply round-trip keeps structure and ids.
- `duplicate`: regenerates every id.
- `repository`: ownership — user B cannot read/update/delete user A's CV (runs against the test DB).

Manual verification: run app, register two users, build a 2-page CV, export PDF, compare with
preview.

## 8. Out of scope (this iteration)

Billing, multiple templates, public share links, collaborative editing, photo upload,
import from LinkedIn/PDF.

## 9. Legacy

The old static app moves to `legacy/` unchanged. A seed script imports its three sample profiles
(AI Engineer, Web Developer, Full-stack Developer) for a demo account.
