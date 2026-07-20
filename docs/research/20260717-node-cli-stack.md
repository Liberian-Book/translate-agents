---
topic: node-cli-stack
created-by: Asimov plan change add-trxng-cli research for a Node CLI package stack
date: 2026-07-17
libraries: [commander, @inquirer/prompts, chalk, ora, dotenv, node:child_process]
used-by: []
---

# Research: node-cli-stack

## Answers

- Use a dual-package layout with `exports` + explicit `type` in `package.json`; keep the published CLI entry (`bin`) thin and executable, and route to the real implementation via `import()`/conditional exports.
- For ESM/CJS compatibility, prefer one internal source format and bridge the other side: ESM implementation + CJS shim is the least painful when using ESM-only deps like Chalk 5.
- For prompts, use `@inquirer/prompts` named imports in ESM and wrap prompt calls in `try/catch` to handle `ctrl+c` / `AbortSignal` rejections cleanly.
- For spinners, prefer `oraPromise()` for async flows; in CI/non-TTY, expect static output instead of animation.
- For env loading, call `import 'dotenv/config'` first in ESM (or `dotenv.config()` first in CJS); use `dotenvx` for multi-env workflows.
- For child-process wrappers, prefer `spawn()` / `execFile()` over `exec()` for untrusted args and large output; use `stdio: 'inherit'` for passthrough CLI commands and `AbortSignal` for cancellation.

## Recommended Approach

- Package layout:
  - `bin/trxng.js` = tiny executable wrapper
  - `src/cli.ts|js` = real command wiring
  - `package.json` with `bin`, `exports`, `files`, and explicit `type`
- If supporting CJS consumers, publish conditional exports (`import` / `require`) and keep the CLI wrapper format-compatible with Node execution.
- Verification stack:
  - unit tests for command parsing and prompt flows
  - spawn tests for `--help`, invalid args, and exit codes
  - `npm link` smoke test in a throwaway project
  - `npm pack` + install-tgz test to catch publish-time breakage

## Installation

```bash
npm install commander @inquirer/prompts chalk ora dotenv
```

## Package / Bin Setup

Recommended shape:

```json
{
  "name": "trxng",
  "type": "module",
  "bin": {
    "trxng": "./bin/trxng.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["bin", "dist"]
}
```

Practical notes:

- `bin/trxng.js` should start with `#!/usr/bin/env node`.
- If the runtime implementation uses Chalk 5, keep that code in ESM; Chalk’s README says v5 is ESM-only.
- If you need a CJS entry, make it a wrapper or transpiled build artifact; don’t `require('chalk')` from CJS.

## Core API / Usage

### Commander

Official docs confirm dual-package support and subcommand/file-extension support.

```typescript
import { Command } from 'commander';

const program = new Command();
program.name('trxng');
program.parse(process.argv);
```

### Inquirer

```typescript
import { input, confirm } from '@inquirer/prompts';

try {
  const name = await input({ message: 'Name?' });
} catch (error) {
  // ctrl+c / abort handling
}
```

### Ora

```typescript
import ora, { oraPromise } from 'ora';

const spinner = ora('Working...').start();
spinner.succeed('Done');

await oraPromise(doWork(), { text: 'Working...' });
```

### dotenv

```typescript
import 'dotenv/config';
```

or in CJS:

```javascript
require('dotenv').config();
```

### child_process wrappers

Prefer direct exec-file/spawn style calls:

```typescript
import { execFile, spawn } from 'node:child_process';

execFile('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });

spawn('git', ['status'], { stdio: 'inherit' });
```

## Platform-Specific Setup

- Node package docs recommend explicit `type` and `exports`; `.mjs`/`.cjs` are the safest way to mix module formats.
- `import` requires full specifiers for relative files; `require()` has extension resolution.
- On Windows, `execFile()` does not run `.cmd`/`.bat` directly like Unix executables; use `spawn()`/`exec()` appropriately or invoke `cmd.exe` when needed.
- Avoid `shell: true` unless necessary; Node docs warn not to pass unsanitized user input to shell-based commands.

## Usage Examples

- `vercel/next.js` — `import { Command } from 'commander'` in a real CLI entrypoint.
- `github/docs` — commander used in script CLIs with direct import wiring.
- `ant-design/ant-design` — `import ora from 'ora'`, `import { input, select } from '@inquirer/prompts'`, and `chalk` together in release scripts.
- `freeCodeCamp/freeCodeCamp` — prompt aggregation via `@inquirer/prompts`.
- `n8n-io/n8n` — `execFileSync('git', ['rev-parse', ...], { encoding: 'utf-8' })` for wrapper-style subprocess calls.
- `google-gemini/gemini-cli` — `spawn(..., { stdio: 'inherit' })` for command passthrough.

## Gotchas & Constraints

- Chalk 5 is ESM-only; this is the biggest compatibility risk for a mixed-module CLI.
- `@inquirer/prompts` rejects on cancel/ctrl+c; unhandled rejection = noisy CLI.
- Ora disables animation in CI/non-TTY; don’t assert spinner frames in those environments.
- `dotenv` preload is convenient, but for ESM the import order matters; load it before env-dependent modules.
- `exports` is a breaking change if you forget to re-export old subpaths.
- `exec()` buffers output and is shell-based; avoid it for regular CLI wrappers.

## Test / Verification Strategy

- Parse tests: cover `--help`, subcommands, option defaults, invalid input, and exit codes.
- Prompt tests: use `@inquirer/testing` for prompt simulation when the CLI is interactive.
- Spinner tests: force `isEnabled: false` for deterministic output; assert plain text, not frames.
- Spawn tests: execute the real bin with `node ./bin/trxng.js ...` or via the linked package name.
- Publish simulation: `npm pack` then install the tarball into a throwaway project; this catches missing `bin`, `files`, and `exports` problems.
- Local dev: `npm link` is good for fast iteration, but it does not replace the pack/install smoke test.

## Gaps

- No official deepwiki index was available for Chalk; guidance here comes from the GitHub README.
- `npm link` workflow is standard Node/npm practice, but not directly documented in the library sources reviewed.
- Commander does not own a `bin` field (it is a library), so `bin` recommendations here come from Node packaging conventions plus CLI examples.

## Confidence

High — confirmed via official/primary docs for Commander, Inquirer, Ora, dotenv, Node package/child_process docs, plus real-world gh_grep examples.
