# Proposal: add-trxng-cli

## Why

The translation pipeline is runnable only through individual scripts and npm aliases, which makes normal use require repository knowledge. A `trxng` CLI creates a dashboard/controller layer above the existing scripts without changing the pipeline engine.

## Appetite

M (<=3d)

## Scope

### In scope
- Add a local executable CLI named `trxng` through `package.json` `bin` and `bin/trxng.js`.
- Add no-argument interactive mode with a welcome screen, book/action prompts, confirmations, and MVP actions: scrape, cleanup, extract terms, prepare translation.
- Add direct commander subcommands for the same MVP actions.
- Wrap existing Node/Python scripts as child processes rather than refactoring script internals.
- Add shared path and script-run helpers for repo-root and sibling book-directory behavior.
- Add safe handling for unsupported future menu actions: translate, review, build preview, deploy.
- Add narrow CLI smoke verification commands.

### Out of scope
- Refactoring existing scripts into importable modules.
- Generalizing the underlying pipeline beyond its current Entrepreneurship/OpenStax assumptions.
- Implementing full translate, review, build preview, deploy, or status command behavior.
- Publishing the package to npm.
- Adding repo-wide lint, test, typecheck, CI, or formatter infrastructure.

## Capabilities

1. **trxng CLI Entrypoint** — Users can run `trxng` locally via package `bin`, see help, and invoke MVP subcommands.
2. **Interactive Pipeline Menu** — Running `trxng` with no arguments opens a guided prompt flow for book/action/scope/confirmation.
3. **Script Wrapper Execution** — CLI commands execute existing pipeline scripts with inherited stdio and safe argv handling.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** NOT REQUIRED
- **Justification**: This is a terminal CLI, not a browser UI. Verification should use CLI smoke checks and narrow command execution checks; full scrape/cleanup pipeline E2E is unsafe because cleanup can delete shared assets.

## Risk Level

MEDIUM — The user-facing CLI is new and introduces dependencies, but the MVP avoids pipeline refactors and uses child-process wrappers around existing behavior.
