## ADDED Requirements

### Requirement: Website manifest location

The system SHALL generate the homepage book manifest at `apps/web-site/books.json` before copying the website source into `dist/site/`.

### Requirement: Manifest discovery source

The system SHALL generate `apps/web-site/books.json` by scanning generated book folders under `apps/web-site/books/<book>/`, not by scanning `data/<book>/.html/`.

### Requirement: Manifest entry shape

Each `books.json` entry MUST include the book slug and a URL path pointing at the generated static book location under `/<book>/`.

#### Scenario: Entrepreneurship manifest URL

- **WHEN** `apps/web-site/books/entrepreneurship/index.html` exists as a generated book folder
- **THEN** `apps/web-site/books.json` MUST include an entry whose URL path is `/entrepreneurship/`

### Requirement: Homepage manifest source

The homepage SHALL read its book list from `/books.json` or a manifest-compatible API response rather than hardcoded book URLs.
