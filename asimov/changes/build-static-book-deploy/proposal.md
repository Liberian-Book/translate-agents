# Proposal: build-static-book-deploy

## Why

Generated book files should not live in or define `apps/web-site`. The build/deploy flow needs a clean boundary where books are generated under `data/<book>`, assembled into a final `dist/site` deploy folder, and discovered by the homepage through a manifest.

## Appetite

M (≤3d)

## Scope

### In scope

- Build translated/static book HTML into `data/<book>/.html`.
- Add a deploy-folder assembly step that copies the reusable `apps/web-site` shell into `dist/site`.
- Copy each generated `data/<book>/.html` output into `dist/site/<book>/`.
- Generate `dist/site/books.json` with book metadata and URL paths for the homepage.
- Update homepage behavior to read `books.json` instead of hardcoding deployed book links.
- Add or update a Cloudflare Pages deploy command/config so Pages publishes `dist/site`.

### Out of scope

- Moving the book catalog to D1 or adding a D1-backed catalog API.
- Redesigning the reader UI beyond what is needed for manifest-driven book links.
- Changing the existing R2 upload contract for `data/<book>`.
- Making `apps/web-site/<book>` or `apps/web-site/entrepreneurship` the source of truth for generated book content.

## Capabilities

1. **static-book-output** — Build final static reader HTML for a book into `data/<book>/.html`.
2. **site-deploy-assembly** — Assemble `dist/site` from the website shell and generated book outputs.
3. **homepage-book-manifest** — Generate and consume `books.json` as the homepage book catalog contract.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** REQUIRED
- **Justification**: The homepage's book list changes from hardcoded cards to manifest-driven links, and deployed book URLs move to the assembled `dist/site/<book>/` layout.

## Risk Level

MEDIUM — The change crosses CLI/build scripts, generated artifact paths, homepage data loading, and Cloudflare Pages deployment, but it can be implemented with a narrow static manifest contract and without new runtime services.
