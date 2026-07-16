---
topic: openstax-book-toc-puppeteer
created-by: research for change-id improve-book-scrape on TOC discovery from OpenStax book pages
date: 2026-07-17
libraries: [Puppeteer, OpenStax]
used-by: [improve-book-scrape]
---

# Research: openstax-book-toc-puppeteer

## Answers

- Use Puppeteer to treat the book page as a dynamic TOC shell: wait for the book navigation to appear, then expand/click all collapsible TOC controls until the anchor set stops changing.
- Collect TOC links from the page DOM with `$$eval('a', ...)` or `evaluate()`, but store both `getAttribute('href')` and browser-resolved `href` so you can detect relative-link normalization and audit surprises.
- Validate every candidate link before accepting it: require `openstax.org`, require the expected book slug, and keep only URLs matching the book’s `/books/<book-slug>/pages/<page-slug>` pattern (plus any allowed section/fragment anchors).
- If expanded TOC extraction is incomplete, fall back to all same-origin links on the book/details page and keep only index/book links that are clearly in the OpenStax book namespace; do not invent missing chapter URLs.
- Persist crawl progress separately from results: a manifest for final normalized TOC entries and a state/checkpoint file for expansion progress, seen anchors, retry counts, and last stable link count.

## Recommended Approach

- Start from the book landing/details page, wait for the navigation/TOC container, then repeatedly expand sections and re-scan until no new anchors appear in two passes.
- Extract anchors from the TOC container, normalize URLs, and reject anything outside the expected host/book path before writing output.
- Write a durable manifest plus a resumable state file so a failed run can continue without re-clicking everything.

## Practical Implementation Notes

- Puppeteer guidance from official docs: `page.$$eval()` is the best fit for bulk anchor extraction; `waitForSelector()`, `waitForNavigation()`, and `waitForNetworkIdle()` are the main stabilization tools.
- Use `$$eval('a', els => els.map(el => el.getAttribute('href')))` when you need raw hrefs; use `.href` when you want browser-resolved absolute URLs.
- For dynamic TOCs, the safest loop is: expand controls → wait for DOM/network to settle → count anchors → stop when the count stabilizes.
- Real-world OpenStax usage across repos consistently uses slug-based URLs under `https://openstax.org/books/<book>/pages/<chapter-slug>` and book landing/details URLs under `https://openstax.org/details/books/<book>`.

## Risks

- TOC markup may change, so selector-based expansion is brittle; prefer container-scoped selectors and count-based convergence rather than hardcoding one button class.
- `.href` can hide malformed relative links by normalizing them into absolute URLs; that is useful for validation, but keep the raw attribute too for debugging.
- Some OpenStax pages may lazy-load or collapse sections differently by book, so a single pass often misses items.
- Over-broad fallback crawling can drift outside the book or pick up marketing/navigation links; strict host/path filtering is required.

## Relevant Source Signals

- Puppeteer official docs/wiki: `page.$$eval()`, `waitForSelector()`, `waitForNavigation()`, `waitForNetworkIdle()`.
- Real-world OpenStax URL patterns from `a2ui-project/a2ui`, `internetarchive/openlibrary`, and other OSS examples.

## Gaps

- I could not verify the exact OpenStax DOM selector names for the live TOC on the current site in this session.
- I could not use web search (authentication unavailable), so live page structure was inferred from official Puppeteer docs and existing OpenStax URL examples.

## Confidence

Medium — strong Puppeteer API confirmation plus multiple OpenStax URL examples, but live OpenStax TOC DOM structure was not directly verified.

## Persisted File

`docs/research/20260717-openstax-book-toc-puppeteer.md`
