## 1. Reader Surface

- [x] 1_1 Implement two-panel translated reader layout
  - **Deps**: none
  - **Refs**: specs/reader-book-page/spec.md; design.md D1; design.md D1A; design.md D2; design.md D3; design.md D4; design.md D5; docs/research/20260811-openstax-reader-layout.md; asimov/specs/book-toc-sidebar/spec.md; asimov/specs/static-book-output/spec.md; asimov/specs/homepage-book-manifest/spec.md
  - **Scope**: agents/agent-archive/book-reader/book-reader.js; agents/agent-archive/book-reader/book-reader.css; agents/agent-archive/book-reviewer/book-reviewer.js; agents/agent-archive/book-reviewer/book-reviewer.css; agents/agent-archive/scripts/build-preview.py; apps/web-site/books/business-ethics/book-reader/book-reader.js; apps/web-site/books/business-ethics/book-reader/book-reader.css; apps/web-site/books/business-ethics/book-reviewer/book-reviewer.js; apps/web-site/books/business-ethics/book-reviewer/book-reviewer.css; apps/web-site/books/business-ethics/review/index.html; apps/web-site/books/entrepreneurship/book-reader/book-reader.js; apps/web-site/books/entrepreneurship/book-reader/book-reader.css; apps/web-site/books/entrepreneurship/book-reviewer/book-reviewer.js; apps/web-site/books/entrepreneurship/book-reviewer/book-reviewer.css; apps/web-site/books/entrepreneurship/review/index.html; apps/web-site/books/introduction-computer-science/book-reader/book-reader.js; apps/web-site/books/introduction-computer-science/book-reader/book-reader.css; apps/web-site/books/introduction-computer-science/book-reviewer/book-reviewer.js; apps/web-site/books/introduction-computer-science/book-reviewer/book-reviewer.css; apps/web-site/books/introduction-computer-science/review/index.html; apps/web-site/books/introduction-philosophy/book-reader/book-reader.js; apps/web-site/books/introduction-philosophy/book-reader/book-reader.css; apps/web-site/books/introduction-philosophy/book-reviewer/book-reviewer.js; apps/web-site/books/introduction-philosophy/book-reviewer/book-reviewer.css; apps/web-site/books/introduction-philosophy/review/index.html; apps/web-site/books/principles-finance/book-reader/book-reader.js; apps/web-site/books/principles-finance/book-reader/book-reader.css; apps/web-site/books/principles-finance/book-reviewer/book-reviewer.js; apps/web-site/books/principles-finance/book-reviewer/book-reviewer.css; apps/web-site/books/principles-finance/review/index.html; apps/web-site/books/world-history-volume-1/book-reader/book-reader.js; apps/web-site/books/world-history-volume-1/book-reader/book-reader.css; apps/web-site/books/world-history-volume-1/book-reviewer/book-reviewer.js; apps/web-site/books/world-history-volume-1/book-reviewer/book-reviewer.css; apps/web-site/books/world-history-volume-1/review/index.html
  - **Acceptance**:
    - Outcome: `/<book>/` generated pages render a desktop two-panel reader, while `/<book>/review/` generated pages preserve the prior reviewer comment/source panel UI.
    - Verify: manual open `apps/web-site/books/entrepreneurship/1-introduction.html` and inspect desktop/mobile layout
  - **Plan**:
    1. Update canonical reader JS so the reader shell exposes TOC and translated content as the only primary panels while keeping `BOOK_PAGES` navigation and current-page state.
    2. Move any retained utility behavior out of persistent side panels; do not add source-language comparison/toggle controls.
    3. Update canonical CSS to match an OpenStax-like two-panel layout with bounded TOC scrolling and readable content width.
    4. Implement mobile TOC open/close state with `aria-controls`, `aria-expanded`, and close-after-link navigation.
    5. Add reviewer assets from the prior reader shell and make build-preview generate `/review/` pages that load them.
    6. Refresh tracked generated reader/reviewer assets from canonical assets for every checked-in book folder.

- [x] 1_2 Add reader E2E coverage
  - **Deps**: 1_1
  - **Refs**: specs/reader-book-page/spec.md; design.md D1; design.md D1A; design.md D2; design.md D3; design.md D4; design.md D5; asimov/specs/book-toc-sidebar/spec.md
  - **Scope**: e2e/site-books.spec.ts
  - **Acceptance**:
    - Outcome: Browser coverage verifies the reader root/page, left TOC navigation/current-page state, translated-only visibility, absence of persistent third panel, mobile TOC reachability, and reviewer route comment/source panel preservation.
    - Verify: e2e e2e/site-books.spec.ts
  - **Plan**:
    1. Add or extend tests around the generated Entrepreneurship static reader route.
    2. Assert TOC is visible on desktop, links navigate relatively, and the current page entry changes after navigation.
    3. Assert visible reader text comes from translated content and source-language comparison/toggle controls are not visible.
    4. Add mobile viewport coverage for opening TOC, following a TOC link, and returning focus/content visibility.
    5. Add reviewer route coverage for `/review/` redirect and old comment/source panel presence.

- [x] 1_3 Verify static site assembly still serves reader pages
  - **Deps**: 1_2
  - **Refs**: specs/reader-book-page/spec.md; design.md D1; asimov/specs/static-book-output/spec.md; asimov/specs/homepage-book-manifest/spec.md
  - **Scope**: scripts/build-site.mjs; apps/web-site/books.json; apps/web-site/index.html; apps/web-site/index.css
  - **Acceptance**:
    - Outcome: Site assembly continues to publish generated book folders with reader roots at `/<book>/`, reviewer roots at `/<book>/review/`, homepage manifest entries pointing at reader roots, homepage book cards linking only to reader pages, and reader pages linking to matching reviewer pages.
    - Verify: integration scripts/build-site.mjs
  - **Plan**:
    1. Run the existing static site build/assembly command or narrow build-site script used by the repo.
    2. Confirm `books.json` still points Entrepreneurship to `/entrepreneurship/` and copied output preserves relative reader asset/page links.
    3. Keep homepage actions focused on reader links; expose reviewer access from the reader page itself.
    4. Do not modify site assembly files unless verification reveals a regression caused by the reader asset changes.
