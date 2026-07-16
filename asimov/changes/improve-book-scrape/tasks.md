## 1. Full-Book Scrape Planning

- [x] 1_1 Refactor discovery into a full-book plan
  - **Deps**: none
  - **Refs**: specs/full-book-scrape/spec.md; design.md D1; design.md D2; design.md D3; docs/research/20260717-openstax-book-toc-puppeteer.md
  - **Scope**: `agents/agent-scrape/scripts/skill-scrape.js`
  - **Acceptance**:
    - Outcome: Running the scrape command generates `data/<bookName>/scrape-plan.json` containing validated same-book OpenStax page URLs before downloads begin.
    - Verify: manual `bun run scrape entrepreneurship https://openstax.org/books/entrepreneurship/pages/1-introduction`
  - **Plan**:
    1. Keep existing argument parsing and raw output directory creation.
    2. Add a discovery function that opens `startUrl`, exposes the TOC, expands collapsed controls, and waits for link count stabilization.
    3. Add URL normalization/deduplication that accepts only `https://openstax.org/books/<bookName>/pages/<slug>` URLs.
    4. Build ordered plan entries with `url` and `fileName` derived from the page slug.
    5. Write `data/<bookName>/scrape-plan.json` before entering the download loop.

- [x] 1_2 Execute downloads from the scrape plan with state tracking
  - **Deps**: 1_1
  - **Refs**: specs/full-book-scrape/spec.md; design.md D2; design.md D4
  - **Scope**: `agents/agent-scrape/scripts/skill-scrape.js`
  - **Acceptance**:
    - Outcome: The scraper downloads planned pages into `data/<bookName>/raw` and writes `data/<bookName>/scrape-state.json` with totals and failures.
    - Verify: manual `bun run scrape entrepreneurship https://openstax.org/books/entrepreneurship/pages/1-introduction`
  - **Plan**:
    1. Replace the current discovered-links loop with iteration over the generated plan entries.
    2. Add per-page retry handling with at least one retry before recording a failure.
    3. Continue after per-page failures instead of aborting the whole run.
    4. Track downloaded, skipped, failed, and failure detail counters.
    5. Write final `scrape-state.json` after closing the browser.

## 2. Verification

- [x] 2_1 Verify full-book discovery on Entrepreneurship
  - **Deps**: 1_2
  - **Refs**: specs/full-book-scrape/spec.md; design.md Risk Map
  - **Scope**: `agents/agent-scrape/scripts/skill-scrape.js`
  - **Acceptance**:
    - Outcome: The generated plan includes pages from chapters beyond chapter 1 and raw output count matches the successful planned downloads minus recorded failures.
    - Verify: manual inspect `data/entrepreneurship/scrape-plan.json`, `data/entrepreneurship/scrape-state.json`, and `data/entrepreneurship/raw/`
  - **Plan**:
    1. Run the Entrepreneurship scrape command from the repo root.
    2. Inspect `scrape-plan.json` for chapter 2+ URLs and no off-book URLs.
    3. Inspect `scrape-state.json` counters and failures.
    4. Confirm `data/entrepreneurship/raw` contains files corresponding to successful plan entries.
