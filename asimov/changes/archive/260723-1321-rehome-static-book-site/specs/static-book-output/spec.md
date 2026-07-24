## ADDED Requirements

### Requirement: Static book website output directory

The system SHALL build each completed book's website-ready static HTML into `apps/web-site/books/<book>/` by default, deriving `<book>` from the source `data/<book>/` directory name.

#### Scenario: Entrepreneurship website output

- **WHEN** the static book build runs for `data/entrepreneurship`
- **THEN** website-ready HTML files MUST be written under `apps/web-site/books/entrepreneurship/`

### Requirement: Translation data source isolation

The system SHALL keep scrape, cleanup, prep, translation, review, glossary, and source book artifacts under `data/<book>/`, and MUST NOT require website-ready generated pages under `data/<book>/.html/` for normal site deployment.

### Requirement: Static book URL compatibility

The static book output MUST use relative asset and page URLs that remain valid when served from `/<book>/` after `apps/web-site/books/<book>/` is copied into `dist/site/<book>/`.

### Requirement: Legacy html output migration

The system MUST treat `data/<book>/.html/` as a legacy generated output location, not as source translation data, and any cleanup of it MUST be limited to that owned generated directory.
