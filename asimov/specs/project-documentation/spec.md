# project-documentation Specification
## Requirements

### Requirement: Data directory documentation

Project documentation SHALL describe `data/<book>/` as the translation data source and artifact root for scrape, cleanup, prep, translate, review, glossary, and related book data.

### Requirement: Website book directory documentation

Project documentation SHALL describe `apps/web-site/books/<book>/` as generated website-ready static book pages that are intentional website content, not stale pollution.

### Requirement: Manifest documentation

Project documentation SHALL describe `apps/web-site/books.json` as the homepage manifest generated from website-ready book folders.

### Requirement: Deploy artifact documentation

Project documentation SHALL describe `dist/site/` as a disposable deploy artifact copied from `apps/web-site/` and published to Cloudflare Pages.

