## 1. Static Book Output

- [ ] 1_1 Build static book HTML into `data/<book>/.html`
  - **Deps**: none
  - **Refs**: specs/static-book-output/spec.md; design.md D1; design.md D2
  - **Scope**: agents/agent-archive/scripts/build-preview.py, package.json, src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: A completed book can be built into `data/<book>/.html/` without writing generated HTML into `apps/web-site/<book>`.
    - Verify: manual `run the narrow static-book build command for one local book and confirm data/<book>/.html/index.html exists`
  - **Plan**:
    1. Inspect the existing preview/static builder entry points and identify the smallest command surface for writing to `data/<book>/.html/`.
    2. Add or adapt a script/CLI path so the output root is `data/<book>/.html/`.
    3. Ensure generated relative links remain copy-safe for `dist/site/<book>/`.
    4. Wire the command where the guided flow should produce static output, if the current flow has a clear final local-output hook.

## 2. Deploy Folder Assembly

- [ ] 2_1 Assemble `dist/site` from shell and generated books
  - **Deps**: 1_1
  - **Refs**: specs/site-deploy-assembly/spec.md; specs/homepage-book-manifest/spec.md; design.md D2; design.md D3; design.md D4
  - **Scope**: package.json, apps/web-site/package.json, apps/web-site/wrangler.toml, bin/trxng.js, src/cli/interactive.mjs, src/cli/lib/paths.mjs, scripts/build-site.mjs
  - **Acceptance**:
    - Outcome: Running the site build creates `dist/site/`, copies the web shell, copies each available `data/<book>/.html/` to `dist/site/<book>/`, and writes `dist/site/books.json`.
    - Verify: integration `run the site build command and inspect dist/site/books.json plus one dist/site/<book>/index.html`
  - **Plan**:
    1. Add a site assembly script that owns cleanup/recreation of `dist/site/` only.
    2. Copy `apps/web-site` shell files while excluding generated book directories and dependency/build folders.
    3. Discover copyable books from `data/*/.html/` or explicit CLI input, then copy each to `dist/site/<book>/`.
    4. Generate `books.json` from the copied outputs with at least `slug` and `url`.
    5. Expose the script through the root package scripts or existing CLI surface.

## 3. Homepage Manifest Loading

- [ ] 3_1 Render homepage books from `books.json`
  - **Deps**: 2_1
  - **Refs**: specs/homepage-book-manifest/spec.md; design.md D4; design.md D5
  - **Scope**: apps/web-site/index.html
  - **Acceptance**:
    - Outcome: The homepage loads its book links from `/books.json` and does not require hardcoded `/<book>/` entries in HTML.
    - Verify: e2e `serve dist/site locally and confirm homepage renders a book link from books.json`
  - **Plan**:
    1. Replace hardcoded book-card data with client-side manifest loading from `/books.json`.
    2. Render entries using `slug` and `url`, with optional display fields only when present.
    3. Add a simple visible fallback or error state if the manifest cannot be loaded.

## 4. Cloudflare Pages Deploy Target

- [ ] 4_1 Publish `dist/site` to Cloudflare Pages
  - **Deps**: 2_1, 3_1
  - **Refs**: specs/site-deploy-assembly/spec.md; design.md D2
  - **Scope**: package.json, apps/web-site/package.json, apps/web-site/wrangler.toml, README.md
  - **Acceptance**:
    - Outcome: The documented deploy command publishes `dist/site` to Cloudflare Pages after the site build step.
    - Verify: manual `run the configured dry-run/build command where available or inspect the Pages command output target before deploy`
  - **Plan**:
    1. Update deploy/build scripts so site assembly runs before deployment.
    2. Point Cloudflare Pages publish configuration or command arguments at `dist/site`.
    3. Document the new source/artifact boundary: `apps/web-site` shell, `data/<book>/.html` book output, `dist/site` deploy output.

## 5. E2E Verification

- [ ] 5_1 Add deploy-folder homepage/book smoke E2E
  - **Deps**: 2_1, 3_1
  - **Refs**: specs/site-deploy-assembly/spec.md; specs/homepage-book-manifest/spec.md; design.md D2; design.md D4
  - **Scope**: package.json, playwright.config.ts, e2e/site-books.spec.ts
  - **Acceptance**:
    - Outcome: An automated browser smoke test serves `dist/site`, verifies the homepage renders a book from `books.json`, and verifies the copied book URL loads.
    - Verify: e2e e2e/site-books.spec.ts
  - **Plan**:
    1. Add the minimal Playwright configuration needed to serve or target the built `dist/site` folder.
    2. Add one smoke spec that opens `/`, waits for a manifest-rendered book link, follows it, and verifies the book page loads.
    3. Expose the E2E command in package scripts without making it part of unrelated existing commands unless already conventional.
