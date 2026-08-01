# Discovery: add-book-toc-sidebar

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search "book page table of contents sidebar navigation reader"` |
| Existing Specs | Done | Direct read of `homepage-book-manifest` and `static-book-output` specs |
| Existing Design/Research Docs | Done | Direct read of prior OpenStax TOC research |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Skipped | Existing repo research covers OpenStax TOC extraction; no new external API/library needed |
| Constraint Check | Done | No new dependency or build-system change expected |

## Key Findings

### 1. The generated reader already has a reusable shell

Generated book pages load `agents/agent-archive/book-reader/book-reader.js` and `agents/agent-archive/book-reader/book-reader.css`. The current reader shell is a two-pane layout with content and a right-side panel, plus previous/next navigation and mobile stacking behavior.

Relevant implementation areas from discovery:

- `agents/agent-archive/book-reader/book-reader.js#L1-L76` — reader shell and right panel setup.
- `agents/agent-archive/book-reader/book-reader.js#L295-L354` — previous/next and arrow-key navigation.
- `agents/agent-archive/book-reader/book-reader.css#L80-L120` — current two-pane layout.
- `agents/agent-archive/book-reader/book-reader.css#L317-L345` — current mobile behavior.

### 2. Page ordering exists, but the manifest is flat

`build-preview.py` already orders chapter/section filenames and writes `BOOK_PAGES` into generated `book-pages.js`. Generated book folders contain a flat page manifest, for example `apps/web-site/books/entrepreneurship/book-pages.js`.

Relevant implementation areas from discovery:

- `agents/agent-archive/scripts/build-preview.py#L73-L99` — filename ordering.
- `agents/agent-archive/scripts/build-preview.py#L221-L321` — writes `BOOK_PAGES` and index redirect.
- `apps/web-site/books/entrepreneurship/book-pages.js#L1-L1` — generated flat page manifest.

### 3. Some generated pages already contain chapter-outline links

At least generated introduction pages include embedded `chapter-outline` markup with links. This can be reused as a source for a page-local or chapter-local TOC, but it may not be present on every page and may not provide a full-book TOC.

Relevant implementation area from discovery:

- `apps/web-site/books/entrepreneurship/1-introduction.html#L32-L50` — embedded chapter-outline links.

### 4. Site assembly should remain unchanged

`scripts/build-site.mjs` discovers generated book folders and copies them to `dist/site`. Existing specs require static book URL compatibility and generated book folders under `apps/web-site/books/<book>/`. A TOC sidebar should be implemented in generated reader assets and/or generated book manifests, without changing homepage manifest behavior.

Relevant implementation areas from discovery:

- `scripts/build-site.mjs#L39-L66` — generated book folder discovery.
- `scripts/build-site.mjs#L98-L105` — homepage `books.json` regeneration.
- `apps/web-site/index.html#L49-L67` — homepage consumes `/books.json`.
- `e2e/site-books.spec.ts#L52-L73` — current manifest/book-copy assertions.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Reader layout | Content plus right-side panel, mobile stacking | Persistent left-side TOC on book pages | CSS/layout must add a left navigation region without breaking existing right panel |
| Reader navigation data | Flat ordered `BOOK_PAGES` list | Clickable TOC entries with current-page state | Either derive entries from flat pages or generate richer metadata |
| Chapter structure | Some pages contain `chapter-outline` links | Reliable left TOC for every book page | Page-local outlines are incomplete for a full-book sidebar |
| Static output | Generated pages under `apps/web-site/books/<book>/` copied to `dist/site/<book>/` | TOC links valid under deployed static URLs | TOC must use relative links consistent with existing static URL compatibility spec |
| Mobile UX | Existing panels stack vertically | TOC usable on narrow screens | Need mobile collapse/placement rule to avoid pushing content too far down |

## Options

### Option A — Derive Left TOC From Existing `BOOK_PAGES` (Recommended)

Use the generated flat `BOOK_PAGES` order to render a left sidebar list of all book pages. Group visually by filename/chapter prefix where possible, mark the current page, and keep all links relative. This is the smallest reliable change because it uses data already generated for every book page and avoids depending on incomplete per-page `chapter-outline` markup.

### Option B — Generate Rich TOC Metadata During Archive Build

Extend `build-preview.py` to generate richer `BOOK_TOC` metadata with chapter groups, page titles, and section hierarchy. This produces a better semantic TOC but requires more generator logic and stronger assumptions about filename/title extraction.

### Option C — Reuse Embedded `chapter-outline` Markup

Move or clone each page's existing `chapter-outline` into a left sidebar. This preserves OpenStax's section-specific outline but is unreliable as a full-book TOC because not every page is guaranteed to contain a complete outline.

## Risks

1. **Sidebar crowds content on smaller screens** — mitigate by keeping desktop as a left sidebar and collapsing or stacking the TOC on mobile using the existing responsive breakpoint.
2. **Flat page names may produce noisy labels** — mitigate by using existing page title extraction if present in `BOOK_PAGES`; otherwise fall back to filename-derived labels.
3. **Generated samples can drift from source reader assets** — mitigate by changing canonical reader assets under `agents/agent-archive/book-reader/` and rebuilding generated site output, rather than hand-editing generated book files.
4. **Full-book TOC may be long** — mitigate with a scrollable sidebar bounded to viewport height, preserving content scroll behavior.
