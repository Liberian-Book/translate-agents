## ADDED Requirements

### Requirement: Static book output directory

The system SHALL build each completed book's deployable static HTML into `data/<book>/.html/`, keeping `data/<book>/` as the generated book artifact source root.

#### Scenario: Entrepreneurship static output

- **WHEN** the static book build runs for `entrepreneurship`
- **THEN** deployable HTML files MUST be written under `data/entrepreneurship/.html/`

### Requirement: Website source isolation

The system SHALL NOT use `apps/web-site/<book>` or `apps/web-site/entrepreneurship` as the source of truth for generated book HTML.

### Requirement: Static book URL compatibility

The static book output MUST use relative asset and page URLs that remain valid after the output is copied from `data/<book>/.html/` to `dist/site/<book>/`.
