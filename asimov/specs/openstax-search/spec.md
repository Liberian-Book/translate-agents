# openstax-search Specification
## Requirements

### Requirement: Search Helper Contract

The system SHALL expose a `searchOpenStaxBooks(query, options)` helper that returns normalized book results with `title`, `slug`, `url`, `source`, and `locale` fields.

### Requirement: Empty Query Handling

The system MUST reject an empty or whitespace-only search query before making an OpenStax network request.

### Requirement: Result Bounds

The system SHALL default OpenStax book search results to 10 items and MUST cap requested result limits at 25 items.

### Requirement: Primary Search Source

The system SHALL use `https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&search=<query>&limit=<limit>&offset=0` as the primary search source.

### Requirement: Catalog Fallback

The system SHALL fall back to `https://openstax.org/apps/cms/api/books/?format=json` with local title and slug filtering when the primary search request fails or returns zero normalized results.

### Requirement: Book Search Command

The system SHALL provide a direct CLI command `trxng books <query>` for searching OpenStax books by name.

### Requirement: Book Search Output

The `trxng books <query>` command SHALL print each result with its title, slug, and URL, and SHALL print the exact message `No OpenStax books found.` when no results match.

### Requirement: Search Does Not Scrape

The book search command MUST NOT run scrape, cleanup, prep, terms, translate, review, preview, deploy, or any existing pipeline script.

