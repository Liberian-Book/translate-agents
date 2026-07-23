---
labels: [site, build, manifest, deploy, books]
source: rehome-static-book-site
summary: The site build scans generated book folders under apps/web-site/books, regenerates apps/web-site/books.json, copies the app shell into dist/site, and flattens each book into dist/site/book-slug.
---
# build:site now discovers generated books from apps/web-site/books and flattens them into dist/site
**Date**: 2026-07-23

## TL;DR
- build-site.mjs treats apps/web-site as the app shell source and apps/web-site/books as the generated book source.
- Generated book folders are recognized by index.html plus book-reader/book-pages.js, not by a stale-folder allowlist.

## Context
The old pipeline copied selected files and treated app book folders as pollution. The new flow keeps intentional book folders under apps/web-site/books, uses a generated manifest, and flattens each book to /<book>/ in dist/site.

## Evidence
### Anchors
- scripts/build-site.mjs -> findGeneratedBooks() — scans apps/web-site/books and requires index.html + book-reader/book-pages.js plus matching data/book-slug source.
- scripts/build-site.mjs -> writeManifest() — regenerates apps/web-site/books.json before copying.
- scripts/build-site.mjs -> copySite() / copyBooks() — copies app shell to dist/site and flattens apps/web-site/books/book-slug to dist/site/book-slug.
- apps/web-site/index.html — still fetches /books.json and renders cards with /<book>/ links.
- apps/web-site/wrangler.toml — Pages still publishes ../../dist/site.

## Pattern
- Use generated-book markers to detect real book outputs.
- Keep build/deploy output disposable; never edit durable content in dist/site.

## When to apply
- Updating static site assembly, manifest generation, or deployment copy rules for book folders.
