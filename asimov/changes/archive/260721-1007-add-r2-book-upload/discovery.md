# Discovery: add-r2-book-upload

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search R2` |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Done | librarian subagent |
| Constraint Check | Done | direct read of `package.json` |

## Key Findings

### 1. Current Pipeline Integration Points

The CLI entrypoint registers commands in `src/cli/index.mjs`, with command wrappers under `src/cli/commands/` and shared script execution through `src/cli/lib/run-script.mjs`. The interactive flow in `src/cli/interactive.mjs` is the likely place to add a final upload prompt or automatic final step, while standalone upload/status commands should be registered through the same CLI command pattern.

The current book data path helper lives in `src/cli/lib/paths.mjs`. R2 upload logic should reuse the same local `data/<book>` layout instead of duplicating path assumptions across commands.

The translation script writes final translated output in `agents/agent-translate/scripts/translate.js`, and archive/preview/export scripts handle later deliverables. An R2 upload step should operate on the whole book folder after local stage output exists, not inside the translator's HTML mutation loop.

### 2. R2 Access Pattern

Cloudflare R2 supports S3-compatible APIs from Node through `@aws-sdk/client-s3`. The recommended client setup is `region: "auto"`, endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, and bucket-scoped R2 S3 credentials.

The required environment is `R2_ACCOUNT_ID` or `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET`. Delete permission is not required for upload/download/list because same-key writes overwrite objects with write permission; delete should remain out of the normal token unless a future prune command is added.

The research details are persisted in `docs/research/20260721-cloudflare-r2-cli-storage.md`.

### 3. Storage Shape

The user expects each book to have a folder by its name. In R2 this should be represented as prefix keys, for example `books/<bookName>/...`, because R2 has object keys rather than real directories.

The safest first implementation is to upload the existing local book folder recursively while preserving relative paths. That makes `data/entrepreneurship/raw/...` map predictably to `books/entrepreneurship/raw/...` or `<bookName>/raw/...` depending on the chosen prefix option.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Credentials | `.env` exists locally and `dotenv` is installed | Validated R2 env loading and friendly errors | No R2-specific config validation yet |
| R2 client | No storage client dependency | S3-compatible client wrapper | Need new AWS SDK dependency and helper module |
| Upload behavior | Local scripts write to `data/<book>` | Recursive upload of one book folder to R2 | Need file walker, content-type handling, key mapping, and verification |
| Book listing | Local files can be inspected manually | CLI command to list remote book prefixes | Need `ListObjectsV2` prefix/delimiter behavior or manifest strategy |
| Translate flow | Local translation pipeline exists | Final step uploads book data after translation/export flow | Need integration point in interactive flow and/or command documentation |
| Safety | No remote writes today | Avoid accidental deletion and support overwrites | Use read/write/list only; no delete in MVP |

## Options

### Option A — Manual Upload Command Only

Add `trxng upload <book>` and `trxng books --remote`. The translate flow remains local and users explicitly upload after completing a book or chapter.

This is safest and smallest, but it does not fully satisfy the request to add upload as a final translate-flow step unless documentation tells users to run it manually.

### Option B — Upload Command Plus Final Flow Step (Recommended)

Add reusable R2 upload/list helpers, expose `trxng upload <book>`, and call the same upload behavior as the final step in the interactive translate flow after local translation outputs are written.

This satisfies both needs: users can manually sync any book, and the guided flow can automatically upload at the end without duplicating logic.

### Option C — Remote-First Pipeline

Make every stage pull from R2 before running and push back after running. This would make R2 the canonical data source immediately.

This is the long-term direction, but it is larger and riskier because it changes every pipeline stage instead of adding a final upload step.

## Risks

1. **Credential leakage** — R2 secrets could appear in logs or config output. Mitigate by centralizing config loading and never printing secret values.
2. **Large object count and slow sync** — Book folders can contain many small files. Mitigate by showing progress and initially uploading all files under a book prefix with simple deterministic keys.
3. **Accidental remote overwrite** — Same-key writes replace existing objects. Mitigate with an explicit prefix convention and optional `--prefix`/version naming later.
4. **False success after partial upload** — A failed upload could leave incomplete remote data. Mitigate by counting attempted/uploaded/failed files and failing the command if any file fails.
5. **Provider-specific assumptions** — R2 is S3-compatible but not identical to AWS S3. Mitigate by using documented endpoint/region settings and verifying with `HeadObject` or list checks.
