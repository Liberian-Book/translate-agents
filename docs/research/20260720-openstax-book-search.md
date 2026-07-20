---
topic: openstax-book-search
created-by: research for Asimov plan change add-openstax-book-search on programmatic OpenStax book-name lookup from a Node CLI
date: 2026-07-20
libraries: [OpenStax, Wagtail CMS API, robots.txt]
used-by: [add-openstax-book-search]
---

# Research: openstax-book-search

## Answers

- Yes — OpenStax books can be searched programmatically from a Node CLI without logging in.
- Best public search endpoint found: `https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&search=<query>&limit=<n>&offset=<m>`.
  - It returns book pages only when `type=books.Book` is set.
  - Default search behavior is fuzzy/partial, not exact-match.
- Result shape is lightweight and CLI-friendly:
  - top level: `{ meta: { total_count }, items: [...] }`
  - each item: `{ id, title, meta: { slug, type, detail_url, html_url, first_published_at, locale } }`
- For exact title lookup or full catalog sync, the stronger source is `https://openstax.org/apps/cms/api/books/?format=json`.
  - It returned `books.length = 110` in this session.
  - Each book object includes richer fields such as `title`, `slug`, `subjects`, `subject_categories`, `cover_url`, `pdf_url`, `webview_rex_link`, `salesforce_name`, and resource flags.
- The `books` API does **not** appear to support server-side search parameters (`search`, `title`) in this session; the `pages` API does.
- Reliability: the search endpoint is good for user-facing lookup, but it can return close matches and multiple editions, so CLI code should still normalize and post-filter by exact title/slug.

## Recommended Approach

- Use the Wagtail pages API for interactive search:
  1. query `type=books.Book&search=<term>`
  2. page with `limit`/`offset` if needed
  3. filter results locally by exact `title` or `slug`
- Cache the full `books` JSON catalog for exact lookup, autocomplete, or offline-ish behavior.
- Prefer `books` JSON as the fallback source if the search API changes, then fall back to `sitemap.xml` only if both APIs fail.

## Installation

```bash
npm install
```

No OpenStax SDK exists here; use plain `fetch`/`https` from Node.

## Core API

### Search endpoint

```text
GET /apps/cms/api/v2/pages/?type=books.Book&search=<query>&limit=<n>&offset=<m>
```

Observed behavior:

- `search=` is fuzzy/partial and case-insensitive.
- `limit=` works.
- `offset=` works.
- Without `type=books.Book`, results include news pages, subject pages, and other site content.

### Catalog endpoint

```text
GET /apps/cms/api/books/?format=json
```

Observed behavior:

- Returns a single page object whose `books` property is the catalog array.
- Rich metadata is present per book, but no search filtering was observed.

## Usage Examples

### Search results (observed)

Query: `biology`

```text
https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&search=biology&limit=10
```

Returned books:

- Biology (`slug: biology`)
- Concepts of Biology (`slug: concepts-biology`)
- Biology for AP® Courses (`slug: biology-ap-courses`)
- Biology 2e (`slug: biology-2e`)

### Full catalog sample (observed)

```json
{
  "title": "Additive Manufacturing Essentials",
  "slug": "books/additive-manufacturing-essentials",
  "webview_rex_link": "https://openstax.org/books/additive-manufacturing-essentials/pages/1-introduction",
  "pdf_url": "https://assets.openstax.org/...pdf"
}
```

## Gotchas & Constraints

- Search results are not exact-title safe by default; they include related editions and sometimes unrelated content if `type` is omitted.
- The search endpoint only returns `items` and `meta.total_count`; it is not a full record API.
- OpenStax `robots.txt` explicitly disallows `GPTBot` from `/books/`, but does not block general user agents from the book pages/API paths tested here.
- I could verify a `privacy-policy` URL in the sitemap, but I did **not** confirm a dedicated public Terms-of-Use page in this session.
- Because the site is public and CMS-backed, endpoint shape can change without notice; cache aggressively and keep a fallback path.

## Fallback Options

1. **Primary**: `pages` search API (`type=books.Book&search=...`) for interactive CLI lookup.
2. **Fallback**: `books/?format=json` plus local filtering for exact names and autocomplete.
3. **Last resort**: `sitemap.xml` / HTML scraping of `/details/books` if the APIs break.

## Risks

- Fuzzy matching can surface the wrong edition or near-match if the CLI auto-selects the first result.
- The catalog may grow beyond the current returned set, so pagination and caching need to be implemented.
- Scraping the HTML page is more brittle than using the public JSON APIs.
- Terms/licensing details were not fully verified here, so a production CLI should keep requests polite and avoid bulk crawling.

## Confidence

High — confirmed via direct live HTTP checks of OpenStax public endpoints and robots.txt.

## Persisted File

`docs/research/20260720-openstax-book-search.md`
