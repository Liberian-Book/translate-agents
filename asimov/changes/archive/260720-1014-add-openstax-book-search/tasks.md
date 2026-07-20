## 1. Search Helper

- [x] 1_1 Add OpenStax search helper and tests
  - **Deps**: none
  - **Refs**: specs/openstax-search/spec.md; design.md D1; design.md D2; design.md D4; docs/research/20260720-openstax-book-search.md
  - **Scope**: src/cli/lib/openstax-books.mjs, src/cli/lib/openstax-books.test.mjs
  - **Acceptance**:
    - Outcome: `searchOpenStaxBooks()` rejects empty queries, clamps limits, normalizes pages API results, and falls back to catalog filtering when primary search has no normalized results.
    - Verify: unit `src/cli/lib/openstax-books.test.mjs`
  - **Plan**:
    1. Implement helper constants for endpoints, default limit 10, max limit 25, and query validation.
    2. Implement primary pages API fetch with `type=books.Book`, encoded query, limit, and offset 0.
    3. Normalize page results into `{ title, slug, url, source, locale }`.
    4. Implement catalog fallback fetch and local title/slug filtering with normalized `books/<slug>` handling.
    5. Add Node test cases with mocked `fetchImpl` for empty query, limit clamp, primary results, and fallback results.

## 2. CLI Command

- [x] 2_1 Add `trxng books` command
  - **Deps**: 1_1
  - **Refs**: specs/openstax-search/spec.md; design.md D3; design.md Interfaces
  - **Scope**: src/cli/index.mjs, src/cli/commands/books.mjs
  - **Acceptance**:
    - Outcome: `trxng books <query>` is registered, accepts `--limit`, prints title/slug/URL results, prints `No OpenStax books found.` for empty result arrays, and does not invoke pipeline scripts.
    - Verify: manual `node bin/trxng.js books --help`
  - **Plan**:
    1. Add a command module that imports `searchOpenStaxBooks()` and registers `books <query>` with optional `--limit`.
    2. Format results as a numbered CLI list with title, slug, and URL.
    3. Handle no matches with the exact spec message and network/helper failures with concise stderr plus exit code 1.
    4. Register the command in `src/cli/index.mjs`.

## 3. Verification

- [x] 3_1 Verify book search behavior
  - **Deps**: 2_1
  - **Refs**: specs/openstax-search/spec.md; proposal.md UI Impact & E2E
  - **Scope**: no file changes
  - **Acceptance**:
    - Outcome: Unit tests pass and CLI help exposes the new search command without running any pipeline scripts.
    - Verify: manual `node --test src/cli/lib/openstax-books.test.mjs && node bin/trxng.js books --help && node bin/trxng.js --help`
  - **Plan**:
    1. Run the helper unit test and CLI help smoke checks; optionally run one live `node bin/trxng.js books biology --limit 3` check if network access is acceptable.
