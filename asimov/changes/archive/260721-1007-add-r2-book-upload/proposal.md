# Proposal: add-r2-book-upload

## Why

Book data currently lives only under local `data/<book>`, which makes a freshly installed CLI dependent on one machine's filesystem. The CLI should be able to upload a completed book folder to Cloudflare R2 so book artifacts can be preserved remotely and inspected or restored later.

## Appetite

M (≤3d)

## Scope

### In scope
- Add R2-backed storage support for recursively uploading one local book folder.
- Add a CLI command to upload a book folder to R2 on demand.
- Add a CLI command or option to list remote book folders stored in R2.
- Add R2 credential/config validation with safe error messages.
- Add the upload behavior as the final step in the guided translate flow.
- Preserve the current local `data/<book>` workflow as the working cache.

### Out of scope
- Rewriting every pipeline stage to run remote-first from R2.
- Adding Cloudflare token creation or account management.
- Adding delete/prune behavior or delete-capable credentials.
- Adding a database-backed index or dashboard.
- Versioning policy beyond deterministic book-folder prefixes and overwrite-capable uploads.
- Storing OpenAI credentials or implementing first-run `trxng init`.

## Capabilities

1. **r2-book-storage** — Store and list complete book artifact folders in Cloudflare R2 while preserving the local book-folder structure.
2. **translate-flow-upload** — Run the R2 upload as the final guided translation-flow step after local book output has been produced.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** NOT REQUIRED
- **Justification**: This is a Node CLI behavior change with external R2 credentials; verification should use command-level integration/manual checks against a test bucket or mocked client rather than browser E2E.

## Risk Level

MEDIUM — the change adds a remote storage service and new write path, but it is bounded to upload/list operations and keeps local files as the execution source.
