# Discovery: add-reader-book-page

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search reader book page translated OpenStax TOC` |
| Existing Specs | Done | Direct read of `book-toc-sidebar`, `static-book-output`, and `homepage-book-manifest` specs |
| Existing Design/Research Docs | Done | Direct read of prior TOC sidebar artifacts and OpenStax reader research |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Done | librarian subagent, persisted to `docs/research/20260811-openstax-reader-layout.md` |
| Constraint Check | Done | Existing specs and finder results show no new dependency, storage, or API requirement |

## Key Findings

### 1. The static site already has generated per-book pages

The current website uses static generated folders under `apps/web-site/books/<book>/`, and the homepage manifest points each book at `/<book>/`. Site assembly copies those generated book folders to the deployed site and regenerates `books.json` from the generated folders.

Relevant implementation areas from discovery:

- `scripts/build-site.mjs#L22-L105` — copies site/books and rewrites `books.json`.
- `apps/web-site/books.json#L1-L38` — homepage book manifest entries.
- `apps/web-site/index.html#L49-L122` — homepage reads the manifest and renders book cards.
- `agents/agent-archive/scripts/build-preview.py#L101-L105` — preview output defaults to `apps/web-site/books/<slug>`.
- `agents/agent-archive/scripts/build-preview.py#L226-L331` — generated chapter output, `book-pages.js`, and root redirect.

### 2. Generated book pages already load a reader shell

The generated translated pages load `book-reader/book-reader.js`, `book-reader/book-reader.css`, and a generated `book-pages.js` manifest. The reader script already builds header/TOC/panel behavior, previous/next navigation, glossary/comment affordances, keyboard navigation, and hover swap behavior.

Relevant implementation areas from discovery:

- `apps/web-site/books/entrepreneurship/index.html#L1-L10` — book root redirects to the first generated page.
- `apps/web-site/books/entrepreneurship/1-introduction.html#L1-L82` — translated page loads reader scripts and bilingual blocks.
- `apps/web-site/books/entrepreneurship/book-reader/book-pages.js#L1-L1` — ordered page manifest.
- `apps/web-site/books/entrepreneurship/book-reader/book-reader.js#L1-L119` — builds reader header, TOC, and panel shell.
- `apps/web-site/books/entrepreneurship/book-reader/book-reader.js#L175-L267` — TOC grouping and relative link generation.
- `apps/web-site/books/entrepreneurship/book-reader/book-reader.js#L291-L569` — glossary, comments, keyboard navigation, hover swap behavior.
- `apps/web-site/books/entrepreneurship/book-reader/book-reader.css#L85-L193` — two-panel layout and sidebar/content pane styling.

### 3. Prior specs already require left TOC behavior

The existing `book-toc-sidebar` spec requires generated book pages to render a left-side TOC from `BOOK_PAGES`, preserve manifest order, use relative links, mark the current page, remain reachable on mobile, and group numbered pages by chapter. This change should build on that contract rather than introduce a separate TOC data model unless the current generated reader cannot satisfy the new route/page goal.

### 4. OpenStax-like behavior maps cleanly to a two-panel shell

OpenStax reader pages use a sticky shell, explicit TOC controls, semantic navigation links, accessibility helpers, responsive collapse behavior, and a readable main content pane. The user explicitly wants only two panels: TOC left and translated book right. That implies dropping or hiding any third/right auxiliary panel from the reader surface while preserving translated content and core navigation.

### 5. The page should display translated content only

The generated translated HTML contains bilingual blocks (`eng hidden` and `vn visible`). The requested reader page should present the Vietnamese translated book as the visible reading content and avoid exposing English/source comparison UI as a reader-facing feature. Existing hidden English blocks can remain in the generated HTML as implementation detail if they are not visible or reachable in the reader UI.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Book URL entry | Homepage manifest links to generated `/<book>/` static folder | A clear reader page for each book | Need define whether `/<book>/` itself is the reader or whether a new `/books/<book>/reader`-style route exists |
| Reader layout | Existing generated reader shell with TOC/content/panel assets | Exactly two panels: left TOC, right translated book | Remove/hide auxiliary right-panel affordance from reader layout or create a separate reader-only shell |
| TOC data | `BOOK_PAGES` manifest and existing TOC grouping behavior | Full-book TOC visible beside content | Reuse must satisfy current-page, relative-link, chapter grouping, and mobile accessibility requirements |
| Content visibility | Generated pages include `eng hidden` and `vn visible` blocks | Translated book only | Ensure reader UI does not expose source-language toggle/comparison features |
| Responsive UX | Existing generated reader has responsive CSS | OpenStax-like mobile collapse/drawer without covering content | Need explicit mobile behavior and accessibility acceptance |
| Verification | No repo-wide test/lint per project docs; existing e2e specs may cover site assembly | Verify reader page and layout behavior | Need narrow script/browser verification path tied to changed files |

## Options

### Option A — Treat existing `/<book>/` generated pages as the reader page (Recommended)

Keep each book's generated static folder as the reader entry. Update the canonical reader assets so `/<book>/` redirects to the first page and all generated pages render exactly the requested two-panel UI: TOC left, translated content right. This best fits existing specs, deployment shape, and static URL compatibility while avoiding a second content routing system.

### Option B — Add a new reader route that wraps generated HTML

Create a distinct reader page per book that loads translated HTML into a new app-level shell. This gives a clean route and full layout control, but duplicates routing/content loading logic already handled by generated static pages and risks breaking static deployment simplicity.

### Option C — Generate one single-page full-book reader per book

Build `/<book>/reader.html` by concatenating all translated pages into one continuous book with a left TOC of anchors. This matches the phrase "book on the right" more literally, but increases page size, complicates assets/anchors, loses current per-page navigation, and creates unbounded content growth for larger books.

## Risks

1. **Ambiguous route expectation** — User said "a page for reader for each book" but the repo already serves `/<book>/`; mitigate by choosing `/<book>/` as the canonical reader unless the user explicitly wants a separate route.
2. **Auxiliary panel behavior may contain useful features** — Removing a right panel could hide glossary/comments; mitigate by preserving non-panel essentials only if they can live inside the two-panel shell without creating a third panel.
3. **Generated and canonical assets can drift** — Mitigate by changing canonical reader assets/generator inputs and regenerating sample site output rather than hand-editing generated pages only.
4. **Long TOC or large books can hurt usability** — Mitigate with a bounded, independently scrollable TOC and no single-page full-book concatenation in the recommended path.
5. **Mobile TOC can obscure content** — Mitigate with explicit accessible collapse/drawer behavior using `aria-expanded`, `aria-controls`, focus management, and real links.
