## 1. Static Book Generation

- [x] 1_1 Rehome static book output default
  - **Deps**: none
  - **Refs**: specs/static-book-output/spec.md; design.md D1; design.md D5
  - **Scope**: `agents/agent-archive/scripts/build-preview.py`, `src/cli/interactive.mjs`
  - **Acceptance**:
    - Outcome: Running the static book build with `data/<book>` and no explicit output writes website-ready pages to `apps/web-site/books/<book>` and no longer creates or depends on `data/<book>/.html` for normal output.
    - Verify: manual `npm run build:book -- data/chapter-e2e-book`
  - **Plan**:
    1. In `build-preview.py`, derive the book slug from `book_dir` and default `output_dir` to repo-root `apps/web-site/books/<slug>` when the optional output argument is absent.
    2. Keep explicit `output_dir` behavior working for one-off manual builds.
    3. Update CLI/help text and guided-flow result messaging so source data remains `data/<book>` and website output is `apps/web-site/books/<book>`.
    4. If cleanup/migration code is added, constrain it to exact legacy `data/<book>/.html/` generated directories and never delete source data.

## 2. Site Assembly And Manifest

- [x] 2_1 Generate app manifest and copy website tree
  - **Deps**: 1_1
  - **Refs**: specs/site-deploy-assembly/spec.md; specs/homepage-book-manifest/spec.md; design.md D2; design.md D3; design.md D4
  - **Scope**: `scripts/build-site.mjs`
  - **Acceptance**:
    - Outcome: `npm run build:site` regenerates `apps/web-site/books.json` from `apps/web-site/books/<book>` generated folders, copies the app shell into `dist/site`, flattens generated book folders into `dist/site/<book>`, and excludes only dev/build junk.
    - Verify: integration `scripts/build-site.mjs`
  - **Plan**:
    1. Replace `data/*/.html` discovery with `apps/web-site/books/*` discovery using generated-book markers such as `index.html` and `book-reader/book-pages.js`.
    2. Write the manifest to `apps/web-site/books.json` before copying, with entries containing at least `slug`, `title`, and `url`.
    3. Replace shell allowlist copying with recursive shell copy from `apps/web-site` to `dist/site`, excluding the `books` container and flattening each generated book into `dist/site/<book>`.
    4. Implement a recursive junk-only exclusion list for names such as `node_modules`, `.wrangler`, and `dist`.
    5. Keep `dist/site` disposable by removing it before each build.

## 3. Verification Coverage

- [x] 3_1 Update E2E coverage for new generated-book location
  - **Deps**: 2_1
  - **Refs**: specs/static-book-output/spec.md; specs/site-deploy-assembly/spec.md; specs/homepage-book-manifest/spec.md; design.md D1; design.md D3; design.md D4
  - **Scope**: `e2e/site-books.spec.ts`
  - **Acceptance**:
    - Outcome: E2E fixtures build generated books into `apps/web-site/books/<book>`, assert `/books.json` links to `/<book>/`, assert copied book pages load from `dist/site/<book>`, and assert generated book folders are flattened into the deploy root.
    - Verify: e2e `e2e/site-books.spec.ts`
  - **Plan**:
    1. Move fixture generated book setup from `data/<book>/.html` to `apps/web-site/books/<book>` or build it through the updated `build:book` default.
    2. Replace the stale app book exclusion test with a flattening test for a generated book folder.
    3. Keep the local static server pointed at `dist/site` and continue verifying homepage and chapter redirect behavior.
    4. Clean up fixture directories under both `data` and `apps/web-site` after the test.

## 4. Documentation

- [x] 4_1 Update project docs for data/site/deploy boundaries
  - **Deps**: 2_1
  - **Refs**: specs/project-documentation/spec.md; design.md D1; design.md D2; design.md D4; design.md D5
  - **Scope**: `README.md`, `agents/agent-archive/agent-archive.md`
  - **Acceptance**:
    - Outcome: Docs state that `data/<book>` is translation source data, `apps/web-site/books/<book>` is website-ready generated book pages, `apps/web-site/books.json` is the homepage manifest, and `dist/site` is disposable deploy output copied from `apps/web-site` and published to Cloudflare Pages.
    - Verify: manual `README and archive-agent docs contain new path contract`
  - **Plan**:
    1. Update static book/site build sections to replace `data/<book>/.html` as the normal output with `apps/web-site/books/<book>`.
    2. Document `apps/web-site/books.json` generation and `/books.json` homepage consumption.
    3. Document `build:site` as a copy from `apps/web-site` to disposable `dist/site` with junk-only exclusions.
    4. Add migration wording that old `data/<book>/.html` directories are legacy generated outputs, not source data.
