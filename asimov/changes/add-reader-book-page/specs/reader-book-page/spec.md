## ADDED Requirements

### Requirement: Canonical per-book reader URL

The system SHALL use each generated static book root `/<book>/` as the canonical reader entry for that book, resolving to translated generated pages under `apps/web-site/books/<book>/`.

#### Scenario: Book root opens reader

- **WHEN** a reader opens `/entrepreneurship/`
- **THEN** the system SHALL display the Entrepreneurship reader by resolving to the first generated translated page for that book.

### Requirement: Per-book reviewer URL

The system SHALL preserve a separate reviewer entry for each generated book at `/<book>/review/`, resolving to generated translated pages with reviewer affordances enabled.

#### Scenario: Book review root opens reviewer

- **WHEN** a reviewer opens `/entrepreneurship/review/`
- **THEN** the system SHALL display the Entrepreneurship reviewer by resolving to the first generated translated page for that book with comment/source-review UI available.

### Requirement: Legacy page review URL compatibility

The system SHALL redirect legacy page-specific review URLs matching `/<book>/<page>/review/` to the canonical reviewer page `/<book>/review/<page>.html`.

### Requirement: Reader page reviewer access

Each reader page SHALL expose a reviewer link that opens the matching canonical reviewer page for the current generated book page.

### Requirement: Two-panel desktop reader layout

On desktop-width reader pages, the system SHALL display exactly two primary reader panels: a left table of contents panel and a right translated book content panel.

### Requirement: Translated-only reader visibility

The reader page MUST expose Vietnamese translated content as the visible book text and MUST NOT expose source-language comparison, toggle, or review UI controls in the reader surface.

### Requirement: Reviewer affordance preservation

The reviewer page MUST preserve the prior comment form/list behavior and source-language inspection panel separate from the translated reading content.

#### Scenario: Source blocks remain hidden

- **WHEN** a generated translated page contains `eng hidden` source-language blocks
- **THEN** those blocks MUST remain hidden from the reader's visible content and keyboard navigation.

### Requirement: Reader table of contents source

The reader table of contents SHALL be built from the generated `BOOK_PAGES` manifest for that book and MUST preserve existing relative-link, current-page indication, and chapter-grouping behavior from `book-toc-sidebar`.

### Requirement: Mobile reader navigation

On mobile-width reader pages, the table of contents MUST remain reachable through an accessible control using `aria-controls` and `aria-expanded`, and opening it MUST NOT permanently obscure the translated content after a table-of-contents link is followed.

### Requirement: Reader content growth bound

The reader MUST keep the existing page-at-a-time generated HTML navigation model and MUST NOT concatenate all translated book pages into a single full-book DOM for normal reading.
