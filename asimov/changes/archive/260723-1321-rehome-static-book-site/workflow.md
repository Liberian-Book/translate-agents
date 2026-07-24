# Workflow State: rehome-static-book-site

> **Source of truth:** Workflow stages/gates → this file · Task completion → `tasks.md`
>
> **Checkbox states:** `[ ]` pending · `[/]` in progress · `[x]` done · `[-]` skipped/N/A

## Plan

- [x] 1. Context + Triage
  - [x] Read `asimov/project.md`, run `bun run asm change list` + `bun run asm spec list`
  - [x] Choose `change-id`, run `bun run asm change new`
  - [x] Classify complexity + escalation flags → record in Notes
- [x] 2. Discovery
  - [x] Execute workstreams (parallel finder/librarian subagents)
  - [x] Fill `discovery.md` — findings, gap analysis, options, risks
  - [x] **GATE 1: user approved direction** _(skip for trivial)_
- [x] 3-6. Artifact Generation (batch)
  - [x] Fill proposal.md (why, appetite, scope, risk, E2E decision)
  - [x] Fill specs/ — scenarios only when they pin acceptance beyond the requirement (default = none)
  - [x] Fill design.md _(standard or escalation-forced — skip if LOW risk + no escalation flags)_
  - [x] Fill tasks.md (deps, refs, done, test, files, approach)
- [x] 7. Validation
  - [x] `bun run asm change validate` passes
  - [-] Oracle review _(manual — only if user asks; triage → user confirms → fix, never auto-fix)_
  - [x] **GATE 2: user approved plan**

## Implement

<!-- RULE: NEVER delete or overwrite ## Implement, ## Archive, ## Notes, or ## Revision Log sections.
     Use `edit` (not `write`) on workflow.md — only update checkboxes, Notes, or Revision Log. -->
<!-- RULE: After completing each task, immediately mark it [x] in tasks.md AND log in Revision Log below. -->
- [x] 1. Read all change artifacts that exist (workflow.md, specs/, proposal.md, design.md, tasks.md)
- [x] 2. Execute tasks sequentially in dependency order
- [x] 3. Update: mark `- [x]` in tasks.md + log in Revision Log after EACH task
- [x] 4. Verify Gate — run commands from `asimov/project.md` § Commands, **MUST execute and observe pass** _(mark `[-]` if N/A)_:
  - [-] Type check
  - [-] Lint
  - [-] Test
  - [x] E2E
- [x] 5. Review _(manual — user runs `/asimov-review-start`; skip for trivial or doc/design-only)_:
  - [x] Code Review
- [x] 6. Findings triage: accept/rebut each finding with rationale
- [-] 7. Review Fix Loop _(max 3 rounds — fix, re-verify, re-review)_
- [x] 8. Validation
  - [x] **Gate: user approved implementation**
  - [x] Extract knowledge

## Archive

- [-] Deploy Gate _(skip if `asimov/project.md` § Commands → Deploy is N/A)_:
  - [-] Run deploy command
  - [-] Run smoke test
- [x] Apply deltas: `bun run asm change apply`
- [x] Archive change: `bun run asm change archive`
- [x] Commit all changes

## Notes

Complexity: standard — cross-cutting flow change across translation data, generated static site pages, homepage manifest, deploy output, and docs/specs.
Escalation flags: cross-boundary, infra-deploy
Gate 1: user approved Option B (generate books into website source, generate `apps/web-site/books.json`, copy `apps/web-site` to `dist/site` with junk-only exclusions). Final user refinement places generated books under `apps/web-site/books/<book>` and flattens them into `dist/site/<book>`.
Gate 2: user approved the validated plan for implementation.
Verify Gate: `asimov/project.md` command entries are placeholders, so type check, lint, and unit test are N/A. Executed real repo gates: `npm run e2e` (3 passed), `npm run build:site` (built `dist/site`, copied 2 books), and `bun run asm change validate rehome-static-book-site` (passed).
Review Round 1: verdict WARN with 0 BLOCK, 3 WARN. Triage rejected all three warnings for this change as valid future work outside the approved static site rehome scope; no fix loop required.
Implementation Gate: user approved implementation after review triage.
Knowledge Extraction: persisted 2 topics for the new static book output location and `build:site` website-tree copy pattern.

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-07-23T12:04:42Z | Zyta | Plan | Completed context and triage for `rehome-static-book-site` | Establish scope and required planning depth before discovery |
| 2026-07-23T12:11:05Z | Zyta | Plan | Completed discovery, Gate 1, proposal, specs, design, and tasks | Capture approved direction and create builder-ready artifacts |
| 2026-07-23T12:13:20Z | Zyta | Plan | Validated change artifacts successfully | Confirm plan structure is accepted by Asimov before Gate 2 |
| 2026-07-23T12:13:55Z | Zyta | Plan | Marked Gate 2 approved | User approved plan for implementation |
| 2026-07-23T12:15:41Z | Zyta | Build | Completed task 1_1; verified with `npm run build:book -- data/chapter-e2e-book` writing to the generated website book location | Rehome default static book output from source data to website pages |
| 2026-07-23T12:17:15Z | Zyta | Build | Completed task 2_1; verified with `npm run build:site` generating `apps/web-site/books.json` and copying generated book folders into `dist/site` | Assemble deploy output from website source tree with junk-only exclusions |
| 2026-07-23T12:18:15Z | Zyta | Build | Completed task 3_1; verified with `npx playwright test e2e/site-books.spec.ts` (3 passed) | Cover homepage manifest links, copied book pages, chapter redirects, and generated book deploy flattening |
| 2026-07-23T12:19:17Z | Zyta | Build | Completed task 4_1; manually verified README and archive-agent docs contain the new path contract | Document `data`, `apps/web-site`, manifest, and disposable deploy boundaries |
| 2026-07-23T12:20:09Z | Zyta | Build | Completed verify gate; `npm run e2e` passed 3 tests, `npm run build:site` copied 2 books, and Asimov validation passed | Confirm implementation is ready for user-initiated review |
| 2026-07-23T12:26:36Z | Zyta | Review | Triaged review round 1: 0 accepted, 3 rejected | Warnings are valid future work but outside this change's approved scope |
| 2026-07-23T12:28:46Z | Zyta | Build | Marked implementation gate approved | User approved implementation after review triage |
| 2026-07-23T12:30:54Z | Zyta | Build | Completed knowledge extraction; 2 topics persisted | Capture reusable project decisions/patterns before archive handoff |
| 2026-07-23T13:21:05Z | Zyta | Archive | Synced change artifacts to final `apps/web-site/books/<book>` layout and validated successfully | Ensure archived specs match the user-approved implementation |
| 2026-07-23T13:21:23Z | Zyta | Archive | Skipped deploy gate because `asimov/project.md` has no real Deploy command | Archive workflow skips deploy when project deploy command is N/A/missing |
| 2026-07-23T13:22:24Z | Zyta | Archive | Marked commit step complete before final archive commit | Include archive workflow completion state in the commit |
