## 1. CLI Foundation

- [x] 1_1 Add package bin and CLI dependencies
  - **Deps**: none
  - **Refs**: specs/cli/spec.md; design.md D1; docs/research/20260717-node-cli-stack.md
  - **Scope**: package.json, bun.lock, bin/trxng.js, src/cli/index.mjs
  - **Acceptance**:
    - Outcome: `node bin/trxng.js --help` starts the CLI entrypoint without module-format errors.
    - Verify: manual `node bin/trxng.js --help`
  - **Plan**:
    1. Add `bin.trxng`, install `commander`, `@inquirer/prompts`, `chalk`, and `ora`, and create a CommonJS executable bin plus minimal CLI skeleton.

- [x] 1_2 Add CLI root program and shared helpers
  - **Deps**: 1_1
  - **Refs**: specs/cli/spec.md; design.md D2; design.md D3; design.md D5; docs/research/20260717-node-cli-stack.md
  - **Scope**: src/cli/index.mjs, src/cli/lib/run-script.mjs, src/cli/lib/paths.mjs
  - **Acceptance**:
    - Outcome: The CLI has a named commander program, direct command registration points, repo-root path resolution, sibling book path summaries, and safe child-process execution via argv arrays.
    - Verify: manual `node bin/trxng.js --help`
  - **Plan**:
    1. Configure commander with name `trxng`, version/help behavior, and no-arg detection that delegates to interactive mode later.
    2. Implement `paths.mjs` to derive repo root and `../<book>` output paths from module location.
    3. Implement `run-script.mjs` using `spawn()` with inherited stdio, argv arrays, repo-root cwd, and non-zero exit propagation.

## 2. MVP Commands

- [x] 2_1 Add scrape and cleanup commands
  - **Deps**: 1_2
  - **Refs**: specs/cli/spec.md; design.md D2; design.md Interfaces
  - **Scope**: src/cli/index.mjs, src/cli/commands/scrape.mjs, src/cli/commands/cleanup.mjs
  - **Acceptance**:
    - Outcome: `trxng scrape <book> <startUrl>` and `trxng cleanup <book>` route to the existing scrape and cleanup scripts with selected book arguments.
    - Verify: manual `node bin/trxng.js scrape --help && node bin/trxng.js cleanup --help`
  - **Plan**:
    1. Add command modules that register with the commander program.
    2. Wire scrape to `agents/agent-scrape/scripts/skill-scrape.js` with `<book>` and `<startUrl>`.
    3. Wire cleanup to `agents/agent-scrape/scripts/skill-cleanup.js` with `<book>`.
    4. Print the selected sibling book output path after successful completion.

- [x] 2_2 Add terms and prep commands
  - **Deps**: 1_2
  - **Refs**: specs/cli/spec.md; design.md D2; design.md Interfaces
  - **Scope**: src/cli/index.mjs, src/cli/commands/terms.mjs, src/cli/commands/prep.mjs
  - **Acceptance**:
    - Outcome: `trxng terms <book> --chapter <n|all>` and `trxng prep <book> --input <file> --output <file>` route to existing term extraction and prep scripts.
    - Verify: manual `node bin/trxng.js terms --help && node bin/trxng.js prep --help`
  - **Plan**:
    1. Add terms command with required `--chapter` option and pass book plus chapter arguments to `term-extract.js`.
    2. Add prep command with required `--input` and `--output` options.
    3. Print selected book and output path context after successful completion.

## 3. Interactive UX

- [x] 3_1 Add no-argument interactive flow
  - **Deps**: 2_1, 2_2
  - **Refs**: specs/cli/spec.md; design.md D3; design.md D4; docs/research/20260717-node-cli-stack.md
  - **Scope**: src/cli/index.mjs, src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: Running `trxng` with no arguments prints `Welcome to trxng`, asks for book/action details, supports MVP actions, handles future actions with the exact MVP placeholder message, and exits cleanly on prompt cancellation.
    - Verify: manual `node bin/trxng.js`
  - **Plan**:
    1. Add no-arg dispatch from `index.mjs` to `interactive.mjs`.
    2. Prompt for book with default `entrepreneurship` and action labels from the spec.
    3. Prompt for action-specific inputs: start URL for scrape, cleanup confirmation, chapter for terms, input/output for prep.
    4. Route supported actions through the same command functions or shared action runners used by commander.
    5. Catch prompt cancellation and exit without stack traces.

## 4. Verification

- [x] 4_1 Run CLI smoke checks
  - **Deps**: 3_1
  - **Refs**: specs/cli/spec.md; proposal.md UI Impact & E2E
  - **Scope**: no file changes
  - **Acceptance**:
    - Outcome: The CLI entrypoint, help output, command help output, unsupported action behavior, and prompt startup are verified without running destructive full pipeline actions.
    - Verify: manual `node bin/trxng.js --help; node bin/trxng.js scrape --help; node bin/trxng.js cleanup --help; node bin/trxng.js terms --help; node bin/trxng.js prep --help`
  - **Plan**:
    1. Run help smoke checks and one prompt-start manual check; do not run cleanup or full scrape unless the operator explicitly chooses to test against disposable data.
