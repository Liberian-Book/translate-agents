# Proposal: add-reader-book-page

## Why

Readers need a dedicated per-book reading surface that shows the translated book without bilingual review controls. The existing generated book pages are already the deployed per-book surface, so the change should make `/<book>/` behave as an OpenStax-like two-panel reader: table of contents on the left and translated content on the right.

## Appetite

M (≤3d)

## Scope

### In scope

- Use the existing generated `/<book>/` static book location as the canonical reader page for each book.
- Update the reader UI to exactly two primary panels on desktop: left table of contents and right translated book content.
- Keep the table of contents derived from the generated `BOOK_PAGES` manifest, preserving current relative-link and current-page behavior.
- Ensure only translated Vietnamese content is visible in the reader surface; source-language `eng hidden` blocks may remain hidden implementation detail.
- Preserve static deployment compatibility under `apps/web-site/books/<book>/` and copied `dist/site/<book>/` output.
- Add or update browser coverage for the reader entry, TOC navigation/current state, translated-only visibility, and mobile TOC reachability.

### Out of scope

- Creating a separate dynamic app route or server API for reading books.
- Concatenating all chapters into one single-page full-book document.
- Scraping OpenStax again or adding a new TOC data source.
- Adding new runtime dependencies.
- Changing translation, glossary, comments storage, R2 upload, or homepage book discovery behavior.
- Removing hidden source-language blocks from generated HTML files.

## Capabilities

1. **reader-book-page** — Each generated book root resolves to an OpenStax-like two-panel reader that displays translated content only.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** REQUIRED
- **Justification**: This changes the primary reader layout and visibility contract; browser coverage is needed to verify the generated static site works after build/copy behavior.

## Risk Level

MEDIUM — the change is UI-only and static, but it affects the main reading experience, generated assets, responsive behavior, and potentially existing glossary/comment affordances.
