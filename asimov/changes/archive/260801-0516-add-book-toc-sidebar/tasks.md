## 1. Reader TOC Sidebar

- [x] 1_1 Add the left-side TOC to canonical reader assets
  - **Deps**: none
  - **Refs**: specs/book-toc-sidebar/spec.md; proposal.md; docs/research/20260717-openstax-book-toc-puppeteer.md
  - **Scope**: agents/agent-archive/book-reader/book-reader.js; agents/agent-archive/book-reader/book-reader.css
  - **Acceptance**:
    - Outcome: Generated book pages can render a left-side TOC from `BOOK_PAGES`, preserve existing prev/next navigation, highlight the current page, and keep the TOC usable on mobile.
    - Verify: manual `bun run build:site && npm --prefix apps/web-site run dev:built`
  - **Plan**:
    1. In `book-reader.js`, create a TOC navigation region from `window.BOOK_PAGES` near the existing reader shell setup.
    2. Use existing page labels/titles when available; otherwise derive readable labels from filenames without changing `BOOK_PAGES` shape.
    3. Mark the current page by comparing the current pathname filename to each entry URL/filename.
    4. In `book-reader.css`, extend the current two-pane layout to include a bounded, scrollable left sidebar on desktop.
    5. Add responsive CSS so the TOC stacks or collapses without covering content on mobile.

- [x] 1_2 Propagate canonical reader assets to generated book outputs
  - **Deps**: 1_1
  - **Refs**: specs/book-toc-sidebar/spec.md; asimov/specs/static-book-output/spec.md
  - **Scope**: apps/web-site/books/*/book-reader/book-reader.js; apps/web-site/books/*/book-reader/book-reader.css; dist/site/**
  - **Acceptance**:
    - Outcome: Existing locally served generated books use the updated TOC-enabled reader assets after the normal site build flow.
    - Verify: manual `bun run build:site`
  - **Plan**:
    1. Rebuild or copy the canonical reader assets into the checked-in generated book folders that `scripts/build-site.mjs` copies to `dist/site`.
    2. Run `bun run build:site` and confirm generated `dist/site/<book>/book-reader/` assets include the TOC changes.

- [x] 1_3 Add E2E browser coverage for the book TOC sidebar
  - **Deps**: 1_2
  - **Refs**: specs/book-toc-sidebar/spec.md; proposal.md
  - **Scope**: e2e/book-toc-sidebar.spec.ts; e2e/site-books.spec.ts
  - **Acceptance**:
    - Outcome: E2E coverage verifies a generated book page displays TOC navigation, highlights the current page, and can navigate to another page through the TOC.
    - Verify: e2e e2e/book-toc-sidebar.spec.ts
  - **Plan**:
    1. Add a focused Playwright spec for a representative generated book page under the built local site.
    2. Assert the TOC region is visible on desktop and contains links sourced from the generated book manifest.
    3. Assert the current page entry is marked, click another TOC entry, and assert navigation succeeds.
    4. Reuse or minimally extend existing site-books setup instead of duplicating server/build helpers.

- [x] 1_4 Make the TOC collapsible by chapter
  - **Deps**: 1_3
  - **Refs**: specs/book-toc-sidebar/spec.md; proposal.md
  - **Scope**: agents/agent-archive/book-reader/book-reader.js; agents/agent-archive/book-reader/book-reader.css; apps/web-site/books/*/book-reader/book-reader.js; apps/web-site/books/*/book-reader/book-reader.css; e2e/book-toc-sidebar.spec.ts; dist/site/**
  - **Acceptance**:
    - Outcome: Numbered pages are grouped into collapsible chapter sections, the current chapter is expanded by default, and page links still work for flat and nested generated books.
    - Verify: e2e e2e/book-toc-sidebar.spec.ts
  - **Plan**:
    1. Group manifest entries by leading chapter number while preserving original page order.
    2. Render numbered groups with native `<details>`/`<summary>` and standalone entries as direct links.
    3. Style summaries and nested links to match a compact collapsible TOC.
    4. Extend E2E assertions for collapsed/expanded chapter behavior.
    5. Propagate canonical reader assets to generated book folders and rebuild site output.

- [x] 1_5 Bust reader asset cache for TOC state updates
  - **Deps**: 1_4
  - **Refs**: specs/book-toc-sidebar/spec.md; proposal.md
  - **Scope**: agents/agent-archive/scripts/build-preview.py; apps/web-site/books/**/*.html; dist/site/**
  - **Acceptance**:
    - Outcome: Generated book pages request a new reader asset version so local and browser caches do not keep stale TOC behavior.
    - Verify: manual `bun run build:site`
  - **Plan**:
    1. Bump `READER_ASSET_VERSION` in `build-preview.py`.
    2. Update generated book HTML query strings from the previous reader asset version to the new one.
    3. Rebuild site output and verify generated HTML references the new version.
