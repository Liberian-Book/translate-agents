# Discovery: add-trxng-cli

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search` returned no memory index |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Done | librarian subagent, saved `docs/research/20260717-node-cli-stack.md` |
| Constraint Check | Done | direct read of `package.json`, `README.md`, `AGENTS.md` context |

## Key Findings

### 1. Existing Scripts Are the Engine

The repo already has runnable scripts for scrape, cleanup, prep, translate, term extraction, review, preview, deploy, and export. `package.json` exposes these as npm scripts, but there is no user-facing CLI entrypoint, command router, prompt flow, or command-specific validation layer.

The first CLI should wrap existing scripts as child processes rather than refactor script internals. This keeps the product layer separate from the pipeline engine and matches the requested MVP.

### 2. The Current Pipeline Is Single-Book in Practice

Several scripts and docs assume `entrepreneurship` and sibling output directories. The CLI can accept a `book` argument, but its MVP should not promise generalized multi-book behavior beyond passing the existing book argument where the underlying scripts support it.

Important constraints from repo instructions include:

- `skill-cleanup.js` deletes the shared `../<book>/assets` directory before re-downloading assets.
- `skill-scrape.js` accepts a `bookName` output argument, but filters links to OpenStax Entrepreneurship pages.
- `prep_html.js` is file-by-file only; there is no verified chapter-wide prep wrapper.
- Review history is append-only and must be created through `start-review-round.py` rather than overwritten.

### 3. Node CLI Stack Fits the Requested UX

Research confirms the requested stack is appropriate: `commander` for commands, `@inquirer/prompts` for interactive menus, `chalk` for styling, `ora` for progress, `dotenv` for env loading, and `spawn()` for child-process wrappers.

The largest module-format risk is Chalk 5 being ESM-only. A minimal implementation should make the package explicitly ESM with `"type": "module"`, keep `bin/trxng.js` tiny and executable, and put command logic under `src/cli/`.

### 4. Verification Must Be Narrow

The repo has no root lint, test, typecheck, CI, or formatter configuration. Verification should focus on CLI smoke checks such as `node bin/trxng.js --help`, targeted command help, and a dry-run or command-construction path if implemented. Full scrape/cleanup should not run casually because it can touch sibling book data and assets.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Entrypoint | npm scripts only | `trxng` executable via package `bin` | Add `bin/trxng.js` and `package.json` `bin` field |
| Command routing | Individual scripts | Named CLI commands and no-arg interactive mode | Add commander program and subcommands |
| Interactive UX | None | Welcome screen, book/action/scope prompts | Add prompt flow using `@inquirer/prompts` |
| Script execution | Manual `node`/`python3` commands | Shared wrapper with inherited stdio and safe args | Add `src/cli/lib/run-script.js` |
| Path handling | Hardcoded and repeated assumptions | Central path helper for repo/book paths and result display | Add `src/cli/lib/paths.js` |
| Safety | Script-specific side effects | Confirm destructive or broad actions | Add confirmations for cleanup and broad scopes |
| Status | `../entrepreneurship/tasks.md` exists | CLI-readable status action later | Out of MVP unless included as command help placeholder |

## Options

### Option A — Thin npm-script Alias

Add `bin/trxng.js` that forwards directly to existing npm scripts and a small menu that shells out to `npm run`. This is fastest, but it duplicates argument parsing in npm scripts, makes status/result display harder, and gives little room for confirmations or path validation.

### Option B — Commander CLI With Child-Process Wrappers (Recommended)

Add an ESM CLI layer with `bin/trxng.js`, `src/cli/index.js`, `src/cli/commands/*`, and shared `run-script`/`paths` helpers. Commands use `spawn()` to call existing scripts directly. No-arg `trxng` opens the menu. This provides a real product layer while preserving the existing scripts as the engine.

### Option C — Refactor Scripts Into Reusable Modules First

Convert existing scripts into importable modules, then build the CLI on top. This is cleaner long term but too large for the MVP because script behavior includes side effects, hardcoded assumptions, and mixed Node/Python tooling.

## Risks

1. **Over-promising multi-book support** — the CLI can accept `book`, but underlying scripts are currently Entrepreneurship-centered. Mitigation: document MVP behavior and pass book arguments only where supported.
2. **Destructive cleanup action** — cleanup can delete `../<book>/assets`. Mitigation: interactive flow MUST confirm cleanup before running, and command docs should warn.
3. **Module-format breakage** — Chalk 5 and modern prompt packages are ESM-first. Mitigation: set `"type": "module"`, use explicit `.js` imports, and keep the bin wrapper minimal.
4. **Prompt cancellation noise** — `@inquirer/prompts` rejects on Ctrl+C. Mitigation: catch prompt cancellation and exit cleanly.
5. **No repo-wide verification** — root has no standard test/lint. Mitigation: require CLI smoke checks and narrow script-command construction checks instead of full pipeline runs.
