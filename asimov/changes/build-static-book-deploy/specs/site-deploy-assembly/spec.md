## ADDED Requirements

### Requirement: Deploy folder root

The system SHALL assemble the Cloudflare Pages publish directory at `dist/site/`.

### Requirement: Website shell copy

The system SHALL copy the reusable website shell from `apps/web-site` into `dist/site/` without treating generated book folders in `apps/web-site` as canonical book content.

### Requirement: Generated book copy

The system SHALL copy each selected `data/<book>/.html/` output into `dist/site/<book>/`.

#### Scenario: Entrepreneurship deploy path

- **WHEN** `data/entrepreneurship/.html/index.html` exists and the deploy folder is built
- **THEN** the deployed copy MUST exist at `dist/site/entrepreneurship/index.html`

### Requirement: Cloudflare Pages publish target

The Cloudflare Pages deploy command or configuration MUST publish `dist/site/`, not `apps/web-site/`.
