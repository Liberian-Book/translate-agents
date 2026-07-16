# Discovery: improve-book-scrape

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Done | librarian subagent |
| Constraint Check | Done | direct read of `asimov/project.md` and generated research |

## Key Findings

### 1. Current Scraper Is Entry-Page Link Discovery

`agents/agent-scrape/scripts/skill-scrape.js` currently accepts `bookName` and `startUrl`, launches Puppeteer, opens only the start URL, reads all currently present `<a>` tags, filters links under `https://openstax.org/books/${bookName}/pages/`, and downloads those links into `data/<bookName>/raw`.

This explains why starting from `1-introduction` only captured preface, chapter 1 pages, suggested resources, and index. The script does not expand the OpenStax table of contents or discover hidden/lazy-loaded chapter links.

### 2. Executable Output Layout Is `data/<book>/raw`

The active scraper writes a flat raw directory under `data/<bookName>/raw`. The cleanup script can consume this layout and write `data/<bookName>/clean` plus `data/<bookName>/assets` when no chapter argument is passed.

Docs also mention `../<book>/chapter-*` layouts, but the current executable scrape/cleanup flow should remain the authority for this change unless a larger path-standardization change is explicitly planned.

### 3. There Is An Existing Manual Page-List Pattern

`agents/agent-scrape/scripts/scrape-ch14-ch15.js` demonstrates a fixed URL list scrape loop for missing pages. The full-book change should remove the need for this kind of one-off manual scraper by generating a validated link plan before downloading.

### 4. Full-Book Discovery Should Be Deterministic First

Research recommends using Puppeteer to open the OpenStax page, expose/expand the table of contents, repeatedly rescan anchors until link count stabilizes, and validate each URL against the expected host and book path. AI may help diagnose ambiguity later, but it should not invent URLs or decide completeness without code validation.

### 5. Manifest/State Artifacts Are Important

A full-book scraper needs a durable scrape plan and run state so users can see what will be downloaded, debug missing pages, and resume or retry failures. The likely output artifacts are `data/<bookName>/scrape-plan.json` and `data/<bookName>/scrape-state.json`, alongside `raw/`.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Book input | `bookName` + `startUrl` required | Continue supporting explicit URL input for now | No change required for MVP full-book scrape |
| TOC discovery | Single pass over current page anchors | Expand OpenStax TOC and collect all book page links | Current discovery misses collapsed chapters |
| Link validation | Prefix filter against `/books/<book>/pages/` | URL normalization, dedupe, strict host/book/path validation | Current filter is simple and has no audit artifact |
| Download execution | Sequential loop writes `slug.html` | Download from validated plan; retry failed pages | Current loop cannot distinguish discovery failure from download failure |
| Observability | Console logs only | Plan/state files with counts, successes, failures | No persistent proof of completeness |
| Output layout | `data/<book>/raw` | Preserve same raw layout | Later pipeline path mismatch is out of scope |

## Options

### Option A — Minimal TOC Expansion In Existing Script

Modify `skill-scrape.js` to open the TOC, click likely expand controls, collect anchors, and download them. This is the smallest code change, but debugging and resumability remain weak if the discovery pass is incomplete.

### Option B — Plan-First Full-Book Scraper In Existing Script (Recommended)

Update `skill-scrape.js` so it performs a plan-first flow: discover full TOC, validate/dedupe links, write `scrape-plan.json`, download pages, and write `scrape-state.json`. This keeps the current command and output layout while adding enough observability to trust full-book scraping.

### Option C — New Orchestrator Script With Existing Scraper As Downloader

Add a new `scrape-book.js` orchestration entrypoint and keep `skill-scrape.js` as a low-level downloader. This is cleaner long-term but broadens scope by introducing a new CLI surface and split responsibilities before the current script is fixed.

## Risks

1. **OpenStax TOC DOM changes** — Selector-specific expansion can break. Mitigate by using broad, container-scoped expandable control detection and count-based convergence.
2. **Incomplete discovery looks successful** — A run can download all discovered links while missing chapters. Mitigate with `scrape-plan.json`, chapter coverage summaries, and warnings when numeric chapter ranges have gaps.
3. **Over-broad crawling** — Fallback extraction could include non-book pages. Mitigate with strict `openstax.org/books/<bookName>/pages/<slug>` validation only.
4. **Path standardization remains unresolved** — Later pipeline stages may still expect different layouts. Keep this change scoped to preserving `data/<bookName>/raw` and record downstream path work separately.
5. **Network/Puppeteer flakiness** — Dynamic UI and page loads can fail intermittently. Mitigate with retries, stabilization waits, and state recording for failed URLs.
