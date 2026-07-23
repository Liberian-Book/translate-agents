# Discovery: build-static-book-deploy

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search` |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Skipped | Existing Cloudflare/R2 research and current Cloudflare Pages usage are sufficient; no new library decision required for the plan. |
| Constraint Check | Done | direct read of existing specs/research artifacts |

## Key Findings

### 1. Local book data already centers on `data/<book>`

The scrape, cleanup, analyze, prep, translate, guided CLI, and R2 upload paths already treat `data/<book>` as the local book data root. Existing specs require uploads to preserve paths under `data/<book>` as `books/<book>/...` R2 keys. This supports the user's direction that generated book files should live outside `apps/web-site`.

### 2. The website is still coupled to one generated book folder

The current `apps/web-site` contains a hardcoded homepage book list plus an `apps/web-site/entrepreneurship` subtree with redirect, reader assets, `book-pages.js`, and generated/static book coupling. That makes the app folder look like a generated artifact destination and risks turning `apps/web-site/entrepreneurship` into the source of truth.

### 3. There is no deploy-folder build step yet

Root scripts and `apps/web-site` scripts still target the site folder directly. There is no pipeline that assembles `dist/site`, copies only the reusable web shell, places generated book HTML under `dist/site/<book>/`, or writes a book manifest for the homepage.

### 4. Static book build can reuse archive/preview concepts but needs a cleaner output contract

The current preview/archive builder emits book-specific `.html` and `book-pages.js`. The new contract should produce final static HTML into `data/<book>/.html` first, then copy those files into `dist/site/<book>/` during website assembly. This separates book generation from website deployment.

### 5. `books.json` is the right first manifest boundary

Existing Pages Functions and D1 schema support comments, not book discovery. A static `dist/site/books.json` lets the homepage load available books without adding D1/API work now. The manifest can later be replaced or backed by a Pages Function/D1 endpoint without changing the generated book-copy contract.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Book source/output root | Pipeline writes under `data/<book>` and R2 upload preserves that layout | Translation flow produces final translated book artifacts under `data/<book>` | Need explicit static HTML output location and contract: `data/<book>/.html` |
| Static book build | Preview builder can emit book-specific HTML/page manifests | Reusable command to build static reader pages from `data/<book>` into `data/<book>/.html` | Existing builder is preview/archive oriented and not integrated into deploy assembly |
| Website shell | `apps/web-site` exists with homepage, functions, schema, and single-book generated subtree | `apps/web-site` should remain source for shell/functions/assets only | Need exclude generated book folders from source-of-truth assumptions |
| Deploy folder | Pages currently deploys the site folder directly | `dist/site` is assembled from shell plus generated books | Need build script and deploy config/script targeting `dist/site` |
| Book discovery | Homepage hardcodes book cards | Homepage reads manifest/API with book URLs | Need generated `dist/site/books.json` and homepage fetch/render logic |
| Future D1 API | D1 is present for comments | Book catalog can later move behind Pages Function/D1 | Need keep homepage contract manifest-shaped so migration is compatible |

## Options

### Option A - Keep generated books inside `apps/web-site`

Continue building or copying `entrepreneurship` and future book folders into `apps/web-site`, then deploy that folder. This is the smallest mechanical change but violates the user's explicit constraint and keeps source and generated artifacts mixed.

### Option B - Assemble `dist/site` from shell plus `data/<book>/.html` (Recommended)

Treat `apps/web-site` as the source shell and `data/<book>` as the book artifact root. A build step creates `data/<book>/.html`, a site assembly step copies shell files into `dist/site`, copies each book's generated HTML into `dist/site/<book>/`, generates `dist/site/books.json`, and deploys `dist/site` to Cloudflare Pages. This matches the requested boundary and preserves a clean path to a later D1-backed API.

### Option C - Upload generated books to R2 and serve through Pages only as an index

Keep all book HTML in R2 and make the Pages site link to R2/public URLs. This aligns with existing R2 storage but adds hosting/CORS/custom-domain decisions and does not satisfy the requested `dist/site/<book>/` deploy-folder layout.

## Risks

1. **Hidden coupling to generated `apps/web-site/entrepreneurship` files** - Existing reader code may assume relative paths inside the generated subtree. Mitigation: static book build must normalize relative asset URLs for the final `dist/site/<book>/` layout and tests should verify at least one generated book loads from the deploy folder.
2. **Accidentally copying generated source artifacts back into the shell** - A broad copy of `apps/web-site` could include current generated book directories. Mitigation: assembly script should explicitly ignore known generated book folders and copy only shell/static/function assets that belong in the deploy source.
3. **Manifest growth and stale entries** - `books.json` is generated from local `data/*` and can become stale if not rebuilt. Mitigation: generate it as part of every deploy-folder build and derive URLs from copied output rather than hand-maintained data.
4. **Cloudflare Pages config mismatch** - Existing deploy commands may point at `apps/web-site`. Mitigation: add/update a dedicated deploy script/config path that publishes `dist/site` and verify with the narrow script changed.
