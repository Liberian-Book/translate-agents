## ADDED Requirements

### Requirement: Static book manifest

The system SHALL generate `dist/site/books.json` during deploy-folder assembly.

### Requirement: Manifest entry shape

Each `books.json` entry MUST include the book slug and a URL path pointing at the copied static book location under `/<book>/`.

#### Scenario: Entrepreneurship manifest URL

- **WHEN** the deploy folder includes the `entrepreneurship` book
- **THEN** `books.json` MUST include an entry whose URL path is `/entrepreneurship/`

### Requirement: Homepage manifest source

The homepage SHALL read its book list from `books.json` or a manifest-compatible API response rather than hardcoded book URLs.

### Requirement: Future API compatibility

The homepage manifest contract SHALL remain compatible with a later D1-backed API by keeping the first static contract as a list of book entries with slug and URL path.
