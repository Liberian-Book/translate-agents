# Discovery: add-openstax-book-search

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search` returned no memory index |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Done | librarian subagent, saved `docs/research/20260720-openstax-book-search.md` |
| Constraint Check | Done | direct read of `package.json` |

## Key Findings

### 1. OpenStax Book Search Is Feasible

OpenStax exposes public JSON endpoints that can support a Node CLI book-name search without login. The best interactive search endpoint found is `https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&search=<query>&limit=<n>&offset=<m>`. It returns lightweight page results with `title`, `id`, and `meta` fields including `slug`, `detail_url`, `html_url`, `locale`, and publication metadata.

The stronger exact-match/catalog fallback is `https://openstax.org/apps/cms/api/books/?format=json`, which returned a catalog array in research. It includes richer book fields such as `title`, `slug`, `subjects`, `cover_url`, `pdf_url`, and `webview_rex_link`, but it did not appear to support server-side search parameters.

### 2. Current CLI Has a Natural Integration Point

The existing `trxng` CLI already has commander commands, interactive mode, command modules under `src/cli/commands`, and shared helpers under `src/cli/lib`. A book search capability can fit as a new command such as `trxng books search <query>` or `trxng search-books <query>`, plus optional interactive selection later.

### 3. Current Scrape Flow Still Needs a Start URL

`trxng scrape <book> <startUrl>` and the existing scrape script are still URL-driven. Search should initially return candidate books and useful URLs; it should not automatically start scraping unless a later change explicitly wires selected results into the scrape flow.

### 4. Existing Dependencies Are Enough

The project already has Node 22 in use and can use native `fetch`. No OpenStax SDK is needed, and no new dependency is required for the MVP search function.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| OpenStax lookup | Hardcoded/manual URLs | Programmatic book-name search | Add API client/helper for search |
| CLI surface | `scrape`, `cleanup`, `terms`, `prep` | Search command and help output | Add command registration and command module |
| Result shape | None | Stable normalized fields | Define title, slug, start URL/html URL, source URL, locale |
| Pagination/bounds | None | Bounded query output | Add default and max result limits |
| Resilience | Manual URL fallback | Catalog fallback if search API fails | Add fallback to `books/?format=json` local filtering |
| Scrape integration | Requires `<startUrl>` | User can copy a returned URL | Keep auto-scrape out of scope for MVP |

## Options

### Option A — Search API Only

Use only the Wagtail pages search API and print results. This is the smallest implementation, but it depends on a single fuzzy endpoint and may fail if that endpoint changes or returns weak matches.

### Option B — Search API With Catalog Fallback (Recommended)

Use the Wagtail pages API as the primary search source, normalize results, bound output, and fall back to the full `books/?format=json` catalog with local filtering when the primary request fails or returns no results. This keeps the MVP robust without adding dependencies or changing scrape behavior.

### Option C — Full Catalog Cache and Interactive Book Picker

Fetch and cache the full catalog locally, then use it for autocomplete and selection inside `trxng`. This is useful later, but it adds cache invalidation and interactive flow scope that is larger than the requested function.

## Risks

1. **Fuzzy search can return the wrong edition** — Auto-selecting a result could start the wrong scrape. Mitigation: the MVP only prints candidates and URLs; it does not auto-run scrape.
2. **OpenStax endpoint shape can change** — Public CMS APIs may evolve. Mitigation: isolate URL construction/parsing in one helper and add catalog fallback.
3. **Unbounded list behavior** — OpenStax catalog can grow. Mitigation: define default and maximum result limits in the spec.
4. **Terms/robots ambiguity** — Research did not fully verify a dedicated Terms-of-Use page. Mitigation: use public JSON endpoints politely, avoid bulk crawling, and keep requests user-initiated.
