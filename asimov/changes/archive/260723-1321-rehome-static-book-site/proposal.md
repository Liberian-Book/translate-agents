# Proposal: rehome-static-book-site

## Why

The current flow mixes translation source data and website-ready generated pages by writing deployable HTML into `data/<book>/.html`. The desired flow separates concerns: `data/<book>` remains the source book data/artifact root, `apps/web-site/books/<book>` becomes the generated website page root, and `dist/site` remains a disposable deploy copy.

## Appetite

M (≤3d)

## Scope

### In scope

- Change static book generation defaults from `data/<book>/.html/` to `apps/web-site/books/<book>/`.
- Generate `apps/web-site/books.json` by scanning generated book folders under `apps/web-site/books/<book>/`.
- Change `build:site` to copy `apps/web-site/` into `dist/site/` while excluding only dev/build junk.
- Preserve homepage behavior that reads `/books.json` and links to `/<book>/`.
- Preserve Cloudflare Pages deployment from `dist/site/`.
- Update E2E coverage to assert generated book folders in `apps/web-site` are retained.
- Update docs and Asimov delta specs/tasks to describe the new data/site/deploy boundaries.
- Include safe cleanup/migration guidance for old `data/<book>/.html` outputs.

### Out of scope

- Changing scrape, cleanup, prep, translate, review, glossary, or R2 upload source-data semantics.
- Adding a D1/API-backed homepage catalog.
- Changing Cloudflare project names, credentials, or deployment target beyond continuing to publish `dist/site`.
- Deleting generated production book folders under `apps/web-site/books/<book>`.
- Automatically pruning arbitrary directories under `data/<book>` beyond owned generated `.html` outputs.

## Capabilities

1. **static-book-output** — Static book generation writes website-ready pages into `apps/web-site/books/<book>/` while reading source data from `data/<book>/`.
2. **site-deploy-assembly** — `build:site` builds disposable deploy output by copying intentional website files from `apps/web-site/` to `dist/site/`, flattening generated book folders into `dist/site/<book>/`, and excluding only dev/build junk.
3. **homepage-book-manifest** — `apps/web-site/books.json` is generated from generated book folders and remains available at `/books.json` after `build:site`.
4. **project-documentation** — Project docs describe `data/<book>`, `apps/web-site/books/<book>`, `apps/web-site/books.json`, and `dist/site` with the new meanings.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** REQUIRED
- **Justification**: The homepage catalog and book links should behave the same at runtime, but their source and copy path change. E2E must prove `/books.json`, `/<book>/`, and generated book retention still work from `dist/site`.

## Risk Level

MEDIUM — the change is mostly path/build logic, but it reverses a previous stale-folder policy and changes which tree is copied to deployment.
