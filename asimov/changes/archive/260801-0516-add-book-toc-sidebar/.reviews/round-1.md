# Review: add-book-toc-sidebar — Round 1

- Date: 2026-07-30
- Reviewable lines: ~1044 (large change — duplicated generated reader assets)
- Verdict: APPROVE
- Counts: BLOCK 0, WARN 0, SUGGEST 0
- Agents spawned/skipped:
  - data-security: not-spawned (no data/auth/storage changes)
  - logic: attempted, unavailable due runtime subagent depth limit; chair covered logic checklist
  - contracts: not-spawned (no API/schema contract changes)
  - frontend: attempted, unavailable due runtime subagent depth limit; chair covered frontend checklist
  - performance: attempted, unavailable due runtime subagent depth limit; chair covered performance checklist

## Context

Intent: add a generated-book TOC sidebar from `window.BOOK_PAGES`, highlight the current page, preserve previous/next and right panel behavior, and add responsive/mobile E2E coverage.

Risk map:
- Frontend/layout: new third column in reader shell and mobile stacking.
- Logic: relative href/current-page helper functions for flat and nested book paths.
- Performance: one-time render of all `BOOK_PAGES` entries per page load; growth axis is per-book page count and structurally finite for generated books.
- Support code: Playwright specs and build lock helpers.

Verification run:
- `npm run e2e -- e2e/book-toc-sidebar.spec.ts` — passed (3 tests).

## Findings

None.

## Notes

- The canonical reader asset change is duplicated into checked-in generated book folders; reviewed as duplicated generated output plus source asset.
- Test run temporarily regenerated `apps/web-site/books.json` and `test-results/`; those review-side artifacts were cleaned/restored after verification.
