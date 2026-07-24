# Review Round 1 — add-r2-book-upload

- Date: 2026-07-21
- Reviewable lines: ~237
- Verdict: WARN
- Agents spawned: data-security attempted but unavailable (runtime subagent depth limit); logic attempted but unavailable; contracts attempted but unavailable; performance attempted but unavailable; frontend not spawned
- Counts: BLOCK 0 | WARN 1 | SUGGEST 1

## Findings

### W1

- ID: W1
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `src/cli/lib/r2-storage.mjs:25`
- Title: Book name is used as both filesystem segment and R2 prefix without validation
- Evidence: `uploadBookToR2(bookName)` resolves the local root via `getDataBookPath(bookName)` and builds keys via ``books/${bookName}/${relativePath}``. `getDataBookPath` is `path.join(repoRoot, 'data', book)`, so values such as `..`, `../entrepreneurship`, or names containing slashes can escape the intended `data/<bookName>` cache and upload unintended local directories while producing keys outside the intended first-level book-prefix contract.
- Impact: A mistyped CLI argument or unexpected external slug in the guided flow can upload data outside the selected book folder to R2, violating the storage contract and risking accidental local data exposure.
- SuggestedFix: Validate `bookName` before resolving paths/keys (for example, allow only a slug segment such as `[a-z0-9][a-z0-9._-]*` with no `/`, `\\`, or `..`) and/or resolve the computed book directory and assert it remains under `repoRoot/data`. Use the same normalized/safe name for the R2 prefix.
- Status: accepted
- Triage: Accepted. The storage contract requires `books/<bookName>/` to represent one book folder, so `bookName` must be a safe slug segment before path resolution or key mapping.

### S1

- ID: S1
- Severity: SUGGEST
- Confidence: HIGH
- Priority: P4
- Agent: chair
- File: `.env.example:7`
- Title: Example advertises `R2_ENDPOINT` that the config loader ignores
- Evidence: `.env.example` includes `R2_ENDPOINT=`, but `loadR2Config` only reads account id, access key, secret key, and bucket, and always derives `https://<account-id>.r2.cloudflarestorage.com`.
- Impact: Users may set `R2_ENDPOINT` expecting custom endpoint behavior and still see the derived endpoint used, making R2 setup/debugging more confusing.
- SuggestedFix: Remove `R2_ENDPOINT` from `.env.example` and docs, or explicitly support it in `loadR2Config` if custom endpoints are intended.
- Status: rejected
- Triage: Rejected for this change. `.env.example` was pre-existing/untracked and outside the approved task scope; the added docs do not advertise `R2_ENDPOINT`, and `specs/r2-book-storage/spec.md` explicitly requires deriving the R2 endpoint from account id.

## Verification

- Ran `node -e "Promise.all([import('./src/cli/lib/r2-config.mjs'), import('./src/cli/lib/r2-storage.mjs'), import('./src/cli/commands/books.mjs'), import('./src/cli/commands/upload.mjs')]).then(()=>console.log('imports ok'))"` — passed.

## Sub-agent notes

The review workflow attempted to spawn data-security, logic, contracts, and performance specialists, but this isolated runtime returned `Subagent depth limit reached (1)` for each spawn. Findings above are from chair self-review of the full diff.
