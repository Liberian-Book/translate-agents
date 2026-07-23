# Review: rehome-static-book-site (Round 1)

- Date: 2026-07-23
- Reviewable lines: ~200 plus untracked new site/support files; generated book/dist/.wrangler/lock/docs mostly skipped
- Agents spawned: data-security, logic, contracts, frontend, performance attempted but runtime rejected all with `Subagent depth limit reached (1)`; chair-only review completed
- Verdict: WARN
- Counts: BLOCK 0, WARN 3, SUGGEST 0

## Findings

### W1

- ID: W1
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `apps/web-site/functions/api/comments.js:49` and `apps/web-site/schema.sql:13`
- Title: Comment reads are limited in result size but not in indexed work
- Evidence: GET runs `WHERE book_id = ? AND page_id = ? ORDER BY created_at ASC LIMIT ?`, while the only index is `(book_id, page_id, element_id)`. That index can narrow by book/page but cannot satisfy `ORDER BY created_at`, so a page with many comments can still require sorting/scanning all matching rows before applying the 200-row limit.
- Impact: Public comment reads can slow down as comments grow per book/page, even though the response size is capped.
- SuggestedFix: Add an index matching the read path, e.g. `(book_id, page_id, created_at, id)`, or change the query/order to match an existing index and document the pagination/bounding contract.
- Status: rejected
- Triage: Rejected for this change. This finding is valid as a future comments API hardening task, but `rehome-static-book-site` does not modify comments reads or `apps/web-site/schema.sql`; the approved scope is static book output, manifest generation, site copying, E2E, and docs.

### W2

- ID: W2
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `apps/web-site/functions/api/comments.js:84`
- Title: Public comment writes remain unbounded by identity or rate
- Evidence: `onRequestPost` accepts cross-origin POSTs with only required-field and length validation before inserting a row. There is no auth, rate limit, per-user/IP throttle, moderation gate, or duplicate/spam control.
- Impact: Any caller can grow the D1 table and consume write/storage quota indefinitely, especially because comments are public and unauthenticated.
- SuggestedFix: Add a deployment-appropriate abuse bound: Cloudflare rate limiting/Turnstile, auth/session identity, per-IP or per-page write throttles, moderation, or an explicit decision that comments are disabled unless protections are configured.
- Status: rejected
- Triage: Rejected for this change. This is a valid pre-existing abuse-bound risk for public comments, but the current change does not touch comment writes, auth, rate limiting, or D1 behavior; fixing it would require a separate scoped security change.

### W3

- ID: W3
- Severity: WARN
- Confidence: HIGH
- Priority: P3
- Agent: chair
- File: `apps/web-site/package.json:12`
- Title: Deploy script can publish dirty local state
- Evidence: `deploy:built` runs `wrangler pages deploy ../../dist/site --project-name openstax-vn --commit-dirty=true`. The change also leaves generated/development outputs in the working tree (`dist/`, `.wrangler` state, generated site folders), and `dist/site` is explicitly a disposable build artifact.
- Impact: Operators can accidentally deploy unreviewed or stale local generated output and bypass Wrangler's dirty-worktree warning, making deploy provenance harder to trust.
- SuggestedFix: Remove `--commit-dirty=true` for normal deploys, or split it into an explicit emergency/local command. Keep `dist/` and `.wrangler/` ignored/untracked and rebuild immediately before deploy.
- Status: rejected
- Triage: Rejected for this change. The deploy command already targets `dist/site`, satisfying the current spec. Removing `--commit-dirty=true` is a deploy provenance policy change outside the approved task scopes and should be handled separately if desired.

## Skipped / Notes

- Full generated book HTML under `apps/web-site/<book>/`, `dist/`, lockfile contents, docs, and `.wrangler` tmp artifacts were not line-reviewed.
- Specialist sub-agent spawning was attempted as required but was blocked by the runtime depth limit; no specialist reports were available for adjudication.
