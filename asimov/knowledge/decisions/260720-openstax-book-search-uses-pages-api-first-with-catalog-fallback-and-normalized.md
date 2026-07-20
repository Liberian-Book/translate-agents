---
labels: [cli, openstax, search, fallback, read-only]
source: add-openstax-book-search
summary: The new trxng books command searches OpenStax via the pages API first, falls back to catalog filtering when needed, and returns normalized results with slug/url/title/locale. It stays read-only and never auto-starts scrape, which avoids scraping the wrong edition from fuzzy matches.
---
# OpenStax book search uses pages API first with catalog fallback and normalized CLI output
**Date**: 2026-07-20

## TL;DR
- Search pages API first (`type=books.Book`), then fall back to catalog filtering if there are no normalized results.
- Normalize CLI output to `{ title, slug, url, source, locale }` and clamp results to a max of 25.
- Keep the command read-only; users copy a URL into `trxng scrape` instead of auto-scraping.

## Context
Users previously had to manually discover an OpenStax URL before scraping. This change adds a query-first CLI entrypoint while avoiding fuzzy auto-selection bugs that could pick the wrong edition.

## Evidence
### Anchors
- `src/cli/lib/openstax-books.mjs` → `searchOpenStaxBooks()` — owns URL construction, fetch, response validation, normalization, fallback filtering, and limit clamping.
- `src/cli/commands/books.mjs` → `registerBooksCommand()` — exposes `trxng books <query>` and prints title, slug, and URL only.
- `src/cli/lib/openstax-books.test.mjs` → search tests — verify empty-query rejection, limit clamping, pages normalization, and catalog fallback.

## Decision
- Primary source: OpenStax pages search endpoint.
- Fallback: books catalog endpoint with local title/slug filtering.
- No auto-scrape from search results.

## Trade-offs
- Pages search is lighter and purpose-built, but fuzzy.
- Catalog fallback is more robust when the search endpoint misses or changes, but it requires fetching the catalog.

## When to apply
- Implementing or debugging OpenStax book discovery.
- Need a safe CLI search flow that should not trigger downstream scraping automatically.
