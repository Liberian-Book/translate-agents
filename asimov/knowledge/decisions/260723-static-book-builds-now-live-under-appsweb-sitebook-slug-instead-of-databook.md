---
labels: [site, static-site, build, deploy, books]
source: rehome-static-book-site
summary: Static book generation now defaults to apps/web-site/books/book-slug, keeping data/book-slug as source translation data and treating old data/book-slug/.html outputs as legacy cleanup only.
---
# Static book builds now live under apps/web-site/books/book-slug instead of data/book-slug/.html
**Date**: 2026-07-23

## TL;DR
- build-preview.py now defaults to apps/web-site/books/book-slug when no output dir is passed.
- data/book-slug stays the source translation root; data/book-slug/.html is legacy output, not the deploy target.

## Context
This change separates source translation artifacts from website-ready HTML so the generated site lives in the app tree that gets deployed.

## Evidence
### Anchors
- agents/agent-archive/scripts/build-preview.py -> build_preview() — default output path is repo_root/apps/web-site/books/book_slug.
- package.json -> build:book / build:preview — CLI still invokes build-preview.py from the translation data root.
- scripts/build-site.mjs — scans apps/web-site/books rather than data/*/.html and deploys books at dist/site/book_slug.

## Decision
- Canonical source tree: data/book-slug/.
- Canonical website output tree: apps/web-site/books/book-slug/.
- Legacy data/book-slug/.html outputs may be cleaned up carefully, but must not be treated as the normal site boundary.

## Trade-offs
- Pros: clearer separation of source vs deployable HTML, less special-casing in site assembly.
- Cons: reverses the old stale-folder policy and requires migration/cleanup of existing outputs.
