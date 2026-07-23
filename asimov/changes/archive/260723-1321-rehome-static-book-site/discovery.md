# Discovery: rehome-static-book-site

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Architecture Snapshot | Done | finder subagent mapped static book generation, site assembly, manifest, homepage, deploy, and E2E coverage |
| Internal Patterns | Done | finder subagent plus direct reads of build scripts, homepage, tests, package scripts, and prior Asimov artifacts |
| External Research | Skipped | no new external API, dependency, or platform behavior required |
| Constraint Check | Done | direct reads of `package.json`, `apps/web-site/package.json`, `apps/web-site/wrangler.toml`, `README.md`, and prior specs |
| Memory Recall | Done | `bun run asm memory search static site book deploy manifest html dist data apps web-site` |

## Key Findings

### 1. Current static book generation writes into translation data

`agents/agent-archive/scripts/build-preview.py` defaults `output_dir` to `<book_dir>/.html`, and the CLI/package scripts call it with only `data/<book>` as input. This makes `data/<book>/.html` both a generated website artifact and a child of the source translation data folder.

### 2. Current site assembly scans `data/<book>/.html`

`scripts/build-site.mjs` discovers books by scanning `data/*/.html/index.html`, copies each discovered `.html` directory into `dist/site/<book>`, and writes `dist/site/books.json`. This conflicts with the desired source/generation split because the website-ready pages should already live in `apps/web-site/<book>`.

### 3. Homepage already uses the right runtime contract

`apps/web-site/index.html` fetches `/books.json`, renders cards, and links to `/<book>/`. The change should preserve this behavior while moving manifest generation from `dist/site/books.json` only to `apps/web-site/books.json` as the source copied into `dist/site/books.json`.

### 4. Build/deploy already publish `dist/site`

Root `deploy`, `apps/web-site deploy:built`, and `wrangler.toml` already publish `dist/site`. The build script must change from allowlisting shell files plus copying `data` books to copying the website source tree into `dist/site` while excluding only development/build junk.

### 5. Existing tests encode the old stale-folder policy

`e2e/site-books.spec.ts` creates `apps/web-site/stale-app-book` and asserts it is excluded from `dist/site`. That was correct for the previous architecture but is now backwards: generated book folders under `apps/web-site/<book>` are intentional website pages and must be retained by `build:site`.

### 6. Prior Asimov docs/specs explicitly reject the new target

The completed `build-static-book-deploy` change states that generated HTML belongs in `data/<book>/.html` and that `apps/web-site/<book>` is stale/generated pollution. This new change needs delta specs that supersede those requirements and docs/tasks that make the new boundary explicit.

### 7. Cleanup/migration is needed for existing generated outputs

The repository already contains generated book folders under `apps/web-site` and may also have `data/<book>/.html` outputs from the old flow. The builder should stop producing new `data/<book>/.html`, generate/update `apps/web-site/<book>` instead, and treat removal of old `.html` outputs as an optional cleanup step that must not delete source translation files.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Static book build | Defaults to `data/<book>/.html` | Defaults to `apps/web-site/<book>` for book slug derived from `data/<book>` | Output path and CLI help/default must change |
| Guided translate flow | Calls `build-preview.py data/<book>` | Produces website-ready pages at `apps/web-site/<book>` | Call can remain if script default changes, but user-facing result text/docs need alignment |
| Site assembly | Scans `data/*/.html`, copies selected shell entries, writes manifest in `dist/site` | Scans `apps/web-site/<book>` generated folders, writes `apps/web-site/books.json`, copies all intentional site files to `dist/site` | Discovery, manifest destination, and copy/exclude policy must change |
| Homepage | Fetches `/books.json` and links to `/<book>/` | Same behavior | Mostly no code change; verify manifest path after build |
| Deploy | Publishes `dist/site` | Same behavior | Ensure build output still contains books and `books.json` |
| E2E | Asserts app book folders are excluded | Asserts generated app book folders are retained and manifest includes them | Test fixtures and expectations must flip |
| Docs/specs | Old boundary says `data/<book>/.html` is source and `apps/web-site/<book>` is pollution | New boundary says `data/<book>` is source data, `apps/web-site/<book>` is generated website pages, `dist/site` is disposable | README and Asimov delta specs/tasks must update |

## Options

### Option A — Keep `build-site` copying from `data/<book>/.html`

This preserves the current implementation and only updates docs minimally. It fails the main requirement because website-ready book pages would still be generated under `data` and `apps/web-site/<book>` would remain non-canonical.

### Option B — Generate books into `apps/web-site/<book>` and copy app tree to `dist/site` (Recommended)

Change `build-preview.py` default output to `apps/web-site/<book>`, generate `apps/web-site/books.json` by scanning generated book folders, and make `build:site` copy `apps/web-site` into `dist/site` while excluding only junk such as `node_modules`, `.wrangler`, and `dist`. This directly matches the requested flow and reduces special-case copying.

### Option C — Generate to an intermediate folder then sync into `apps/web-site/<book>`

Build into a temporary/generated directory and add a second sync step into `apps/web-site`. This could reduce accidental partial writes, but adds extra moving parts without a clear benefit for the current scripts.

## Risks

1. **Accidental copy of dev/build junk** — copying the app tree wholesale can include `node_modules`, `.wrangler`, or nested `dist`; mitigate with a narrow recursive exclusion list and E2E assertions.
2. **Generated book folder detection includes non-book app folders** — scanning `apps/web-site/*` could mistake `assets` or `functions` for books; mitigate by requiring `index.html` plus generated book assets such as `book-reader/book-pages.js`, and by excluding known app infrastructure names.
3. **Old `data/<book>/.html` becomes misleading** — stale outputs may survive after the script change; mitigate with docs and a safe cleanup task that removes only `.html` generated folders when explicitly present.
4. **Manifest drift** — if book generation does not refresh `books.json`, homepage can miss new pages; mitigate by making `build:site` regenerate `apps/web-site/books.json` before copying to `dist/site`.
