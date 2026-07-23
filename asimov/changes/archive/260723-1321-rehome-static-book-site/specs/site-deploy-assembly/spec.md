## ADDED Requirements

### Requirement: Deploy folder root

The system SHALL assemble the Cloudflare Pages publish directory at `dist/site/`.

### Requirement: Website source copy

The system SHALL copy intentional website files from `apps/web-site/` into `dist/site/`, and SHALL copy generated book folders from `apps/web-site/books/<book>/` into `dist/site/<book>/`.

### Requirement: Junk-only exclusion

The site build MUST exclude development/build junk such as `node_modules`, `.wrangler`, and `dist`, and MUST NOT exclude generated book folders solely because they are under `apps/web-site/books/<book>/`.

### Requirement: Cloudflare Pages publish target

The Cloudflare Pages deploy command or configuration MUST publish `dist/site/`, not `apps/web-site/`.
