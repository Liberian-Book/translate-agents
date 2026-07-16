# Proposal: improve-book-scrape

## Why

The current scraper only downloads links visible from the provided start page, so it can miss collapsed OpenStax chapters and produce an incomplete raw dataset. The scraper should discover the whole book table of contents first, persist the planned URLs, and then download validated pages into the existing raw output layout.

## Appetite

M (≤3d)

## Scope

### In scope
- Update `agents/agent-scrape/scripts/skill-scrape.js` to discover full-book OpenStax page links before downloading.
- Preserve the existing CLI contract: `node .../skill-scrape.js <bookName> <startUrl>` and `bun run scrape <bookName> <startUrl>`.
- Preserve existing output layout for raw HTML: `data/<bookName>/raw/<slug>.html`.
- Add durable scrape observability files under `data/<bookName>/`: `scrape-plan.json` and `scrape-state.json`.
- Validate and deduplicate discovered URLs before download.
- Add basic retry/failure tracking for page downloads.

### Out of scope
- Changing cleanup, analysis, translate, review, archive, or deploy scripts.
- Standardizing the repo-wide `data/<book>` vs `../<book>` layout mismatch.
- Implementing book-name search or interactive CLI selection.
- Implementing AI-driven URL generation or autonomous AI loop behavior.
- Scraping non-OpenStax sources.

## Capabilities

1. **Full-book TOC discovery** — The scraper discovers all OpenStax book page URLs available through the expanded table of contents rather than only the start page's visible links.
2. **Scrape plan and state persistence** — The scraper writes auditable plan/state JSON artifacts that record discovered pages, download progress, and failures.
3. **Validated raw page download** — The scraper downloads only validated same-book OpenStax page URLs into the existing raw output folder with retry tracking.

## UI Impact & E2E

- **User-visible UI behavior affected?** NO
- **E2E required?** NOT REQUIRED
- **Justification**: This is a local CLI/script behavior change. Verification should run the script on a narrow OpenStax input and inspect generated files/artifacts.

## Risk Level

MEDIUM — The change depends on dynamic OpenStax TOC behavior and Puppeteer timing, but it is constrained to one script and preserves the existing CLI/output contract.
