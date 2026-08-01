## ADDED Requirements

### Requirement: Book page table of contents source

Generated book pages SHALL render their table of contents from the existing `BOOK_PAGES` manifest for that book, preserving the manifest order.

### Requirement: Desktop table of contents placement

On desktop-width book pages, the system SHALL display the table of contents as a left-side navigation region beside the main book content.

### Requirement: Table of contents link contract

Each table of contents entry MUST link to its target generated HTML page using a relative URL that remains valid when the book is served from `/<book>/`.

### Requirement: Current page indication

The table of contents SHALL visibly mark the entry whose URL matches the current generated book page.

#### Scenario: Current page is highlighted

- **WHEN** a reader opens `/entrepreneurship/1-introduction.html`
- **THEN** the table of contents entry for `1-introduction.html` SHALL be marked as the current page.

### Requirement: Mobile table of contents behavior

On mobile-width book pages, the table of contents MUST remain reachable without overlaying or hiding the main book content.

### Requirement: Collapsible chapter groups

The table of contents SHALL group numbered book pages by chapter number into collapsible chapter sections, with the current page's chapter expanded by default.
