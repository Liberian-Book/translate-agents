## 1. R2 Storage Foundation

- [x] 1_1 Add R2 dependencies and config validation
  - **Deps**: none
  - **Refs**: specs/r2-book-storage/spec.md; design.md D3; docs/research/20260721-cloudflare-r2-cli-storage.md
  - **Scope**: package.json, package-lock.json, src/cli/lib/r2-config.mjs
  - **Acceptance**:
    - Outcome: R2 operations can load validated config from env and fail with clear missing-variable messages without printing secret values.
    - Verify: manual `node -e "import('./src/cli/lib/r2-config.mjs').then(m=>m.loadR2Config())"`
  - **Plan**:
    1. Add `@aws-sdk/client-s3` to dependencies using the repo's package manager.
    2. Create `src/cli/lib/r2-config.mjs` that reads env via `dotenv/config` or current env, accepts `R2_ACCOUNT_ID` or `CLOUDFLARE_ACCOUNT_ID`, and derives endpoint.
    3. Throw validation errors listing missing non-secret variable names only.

- [x] 1_2 Implement reusable R2 book storage helpers
  - **Deps**: 1_1
  - **Refs**: specs/r2-book-storage/spec.md; design.md D1; design.md D2; design.md D3; design.md D4; design.md D5
  - **Scope**: src/cli/lib/r2-storage.mjs, src/cli/lib/paths.mjs
  - **Acceptance**:
    - Outcome: A reusable helper can upload all regular files under `data/<bookName>` to `books/<bookName>/<relativePath>` and list remote book prefixes.
    - Verify: manual `node -e "import('./src/cli/lib/r2-storage.mjs').then(m=>console.log(Object.keys(m)))"`
  - **Plan**:
    1. Reuse existing path helpers to resolve local `data/<bookName>` without hardcoding the workspace root.
    2. Add a recursive file walker that returns regular files only and preserves relative paths with POSIX separators for object keys.
    3. Add `uploadBookToR2(bookName)` using `PutObjectCommand` and return the design.md upload result shape.
    4. Add `listRemoteBooks()` using `ListObjectsV2Command` over prefix `books/` and delimiter `/`.
    5. Do not implement delete, prune, or remote cleanup behavior.

## 2. CLI Commands

- [x] 2_1 Add manual upload command
  - **Deps**: 1_2
  - **Refs**: specs/r2-book-storage/spec.md; specs/translate-flow-upload/spec.md; design.md D5
  - **Scope**: src/cli/index.mjs, src/cli/commands/upload.mjs
  - **Acceptance**:
    - Outcome: Users can run `trxng upload <book>` to upload one local book folder and see attempted/uploaded/failed counts.
    - Verify: manual `node bin/trxng.js upload entrepreneurship`
  - **Plan**:
    1. Add `src/cli/commands/upload.mjs` following the existing command wrapper style.
    2. Register the command in `src/cli/index.mjs`.
    3. Print a concise summary and return a failing exit code when the helper reports failed files.

- [x] 2_2 Add remote books listing command or option
  - **Deps**: 1_2
  - **Refs**: specs/r2-book-storage/spec.md; design.md D2
  - **Scope**: src/cli/index.mjs, src/cli/commands/books.mjs
  - **Acceptance**:
    - Outcome: Users can list remote book folders discovered under the configured R2 bucket's `books/` prefix.
    - Verify: manual `node bin/trxng.js books --remote`
  - **Plan**:
    1. Extend the existing books command with a `--remote` option if it has compatible command semantics.
    2. If the existing books command is OpenStax-search-only, add a clear subcommand or option without changing current search behavior.
    3. Print remote book names from `listRemoteBooks()` and handle an empty bucket with a friendly message.

## 3. Translate Flow Integration

- [x] 3_1 Add R2 upload as the guided translate-flow final step
  - **Deps**: 2_1
  - **Refs**: specs/translate-flow-upload/spec.md; design.md D1; design.md D5
  - **Scope**: src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: The guided flow runs the shared book upload behavior as its final remote-storage step after local translation output is complete.
    - Verify: manual `node bin/trxng.js`
  - **Plan**:
    1. Locate the existing guided flow completion point after translation-related local outputs are produced.
    2. Call the same upload helper used by `trxng upload <book>` as the final step.
    3. Show upload summary separately from local translation success.
    4. If upload fails, preserve local outputs and surface the final step failure clearly.

## 4. Documentation And Verification

- [x] 4_1 Document R2 env and upload flow
  - **Deps**: 3_1
  - **Refs**: specs/r2-book-storage/spec.md; specs/translate-flow-upload/spec.md; design.md D3; docs/research/20260721-cloudflare-r2-cli-storage.md
  - **Scope**: AGENTS.md, README.md
  - **Acceptance**:
    - Outcome: Developers know required R2 env vars, the `books/<bookName>/` key layout, and that translate flow uploads as the final step.
    - Verify: manual `grep -n "R2" README.md AGENTS.md`
  - **Plan**:
    1. Add concise R2 env setup notes without including secret values.
    2. Document `trxng upload <book>` and remote book listing.
    3. Document that delete permission is not required for normal CLI use.

- [x] 4_2 Verify R2 upload on a narrow fixture
  - **Deps**: 4_1
  - **Refs**: specs/r2-book-storage/spec.md; specs/translate-flow-upload/spec.md; design.md Risk Map
  - **Scope**: no production files
  - **Acceptance**:
    - Outcome: A real or test book folder uploads to R2 and appears in remote book listing.
    - Verify: manual `node bin/trxng.js upload <test-book> && node bin/trxng.js books --remote`
  - **Plan**:
    1. Use a small existing or temporary local book folder under `data/`.
    2. Run upload with configured R2 env.
    3. Run remote listing and verify the book name appears.
    4. Record any R2-specific failure messages for follow-up.
