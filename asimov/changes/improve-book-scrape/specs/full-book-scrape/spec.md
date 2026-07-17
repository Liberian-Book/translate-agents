## ADDED Requirements

### Requirement: Full-book TOC discovery

The scraper SHALL discover OpenStax book page links by opening the provided `startUrl`, making the book table of contents available, expanding collapsed table-of-contents sections where possible, and collecting page links after the link set stabilizes.

#### Scenario: Collapsed chapters are represented

- **WHEN** the OpenStax table of contents contains collapsed chapter sections
- **THEN** the scrape plan SHALL include links discovered after expansion, not only links visible on the initial page load

### Requirement: Same-book link validation

The scraper SHALL accept only URLs whose normalized absolute URL matches the same OpenStax book namespace: `https://openstax.org/books/<bookName>/pages/<pageSlug>`.

#### Scenario: Non-book navigation links are ignored

- **WHEN** discovery sees links outside `openstax.org/books/<bookName>/pages/`
- **THEN** those links SHALL NOT be included in the scrape plan or downloaded

### Requirement: Scrape plan persistence

The scraper SHALL write `data/<bookName>/scrape-plan.json` before downloading pages.

The scrape plan SHALL include at minimum the book name, start URL, generated timestamp, total planned page count, and ordered page entries containing URL and output filename.

### Requirement: Scrape state persistence

The scraper SHALL write `data/<bookName>/scrape-state.json` by the end of the run.

The scrape state SHALL include at minimum status, started timestamp, finished timestamp when complete, total planned page count, downloaded page count, skipped page count, failed page count, and failed page details.

### Requirement: Existing raw output layout

The scraper SHALL continue writing raw HTML pages to `data/<bookName>/raw/<pageSlug>.html`.

### Requirement: Download retry tracking

The scraper SHALL retry failed page downloads at least once before marking a page failed in `scrape-state.json`.

#### Scenario: One page fails repeatedly

- **WHEN** a planned page cannot be downloaded after the configured retry attempts
- **THEN** the scraper SHALL continue with remaining planned pages and record the failed URL in `scrape-state.json`

## MODIFIED Requirements

### Requirement: Scrape command inputs

The scraper SHALL continue requiring `bookName` and `startUrl` positional arguments for this change.
