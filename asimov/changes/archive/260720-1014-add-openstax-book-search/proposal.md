# Proposal: add-openstax-book-search

## Why

Users currently need to manually find an OpenStax book URL before scraping. A book-name search function lets `trxng` discover candidate OpenStax books and show usable URLs before any pipeline step runs.

## Appetite

M (<=3d)

## Scope

### In scope
- Add a reusable OpenStax book search helper for Node CLI code.
- Add a direct CLI command `trxng books <query>` that searches OpenStax books by name.
- Use the OpenStax pages search API as the primary source and the books catalog API as fallback.
- Normalize results into a stable CLI-facing shape.
- Bound returned results with default and maximum limits.
- Add narrow verification for search normalization and CLI help/output behavior.

### Out of scope
- Automatically starting scrape from a selected search result.
- Adding a full interactive book picker/autocomplete flow.
- Persisting a local catalog cache.
- Scraping OpenStax HTML pages as the primary implementation.
- Generalizing existing scrape link filtering beyond its current assumptions.

## Capabilities

1. **OpenStax Book Search Helper** - CLI code can search OpenStax books by name and receive normalized, bounded result objects.
2. **Book Search CLI Command** - Users can run `trxng books <query>` and see candidate book titles, slugs, and usable URLs.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** NOT REQUIRED
- **Justification**: This is terminal CLI behavior. Verification can use unit tests with mocked fetch for the helper and CLI smoke checks; live OpenStax network checks should be optional/manual to avoid brittle external E2E.

## Risk Level

MEDIUM - The change adds external network behavior and a new query/list command, but it is read-only, bounded, and isolated from destructive pipeline actions.
