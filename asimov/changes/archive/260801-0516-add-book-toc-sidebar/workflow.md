# Workflow State: <change-id>

> **Source of truth:** Workflow stages/gates → this file · Task completion → `tasks.md`
>
> **Checkbox states:** `[ ]` pending · `[/]` in progress · `[x]` done · `[-]` skipped/N/A

## Plan

- [x] 1. Context + Triage
  - [x] Read `asimov/project.md`, run `bun run asm change list` + `bun run asm spec list`
  - [x] Choose `change-id`, run `bun run asm change new`
  - [x] Classify complexity + escalation flags → record in Notes
- [ ] 2. Discovery
  - [x] Execute workstreams (parallel finder/librarian subagents)
  - [x] Fill `discovery.md` — findings, gap analysis, options, risks
  - [x] **GATE 1: user approved direction** _(skip for trivial)_
- [x] 3-6. Artifact Generation (batch)
  - [x] Fill proposal.md (why, appetite, scope, risk, E2E decision)
  - [x] Fill specs/ — scenarios only when they pin acceptance beyond the requirement (default = none)
  - [-] Fill design.md _(standard or escalation-forced — skip if LOW risk + no escalation flags)_
  - [x] Fill tasks.md (deps, refs, done, test, files, approach)
- [ ] 7. Validation
  - [x] `bun run asm change validate` passes
  - [ ] Oracle review _(manual — only if user asks; triage → user confirms → fix, never auto-fix)_
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
- [x] 7. Review Fix Loop _(max 3 rounds — fix, re-verify, re-review)_
- [ ] 8. Validation
  - [ ] **Gate: user approved implementation**
  - [ ] Extract knowledge

## Archive

- [-] Deploy Gate _(skip if `asimov/project.md` § Commands → Deploy is N/A)_:
  - [-] Run deploy command
  - [-] Run smoke test
- [x] Apply deltas: `bun run asm change apply`
- [x] Archive change: `bun run asm change archive`
- [ ] Commit all changes

## Notes

- Change ID: `add-book-toc-sidebar`.
- Request: add a table of contents on the left side of book pages.
- Complexity: small UI enhancement. Expected artifacts: discovery, proposal, one capability spec, tasks. Design is skippable unless discovery finds cross-file architecture or state risks.
- Escalation flags: none known. No new dependency expected.
- Gate 1 decision: use existing `BOOK_PAGES` manifest to render the left sidebar TOC.
- Design skipped: low-risk small UI change with no new dependency, data model, external integration, or architecture decision.

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-07-30T03:41:47Z | Zyta | Context + Triage | Created change and recorded small UI-enhancement classification. | Establish planning scope before discovery. |
| 2026-07-30T03:41:47Z | Zyta | Discovery | Added discovery findings and options for a left-side book TOC. | Surface implementation direction before artifact generation. |
| 2026-07-30T03:52:06Z | Zyta | Artifact Generation | Added proposal, book-toc-sidebar spec, and implementation tasks; skipped design. | Convert approved direction into builder-ready plan artifacts. |
| 2026-07-30T03:52:06Z | Zyta | Validation | Ran `bun run asm change validate add-book-toc-sidebar`; validation passed after making the E2E task explicit. | Confirm artifacts are structurally valid before plan approval. |
| 2026-07-30T03:52:06Z | Zyta | Validation | Gate 2 approved by user. | Mark plan ready for implementation handoff. |
| 2026-07-30T03:59:17Z | Zyta | Implement | Completed task 1_1; `node --check agents/agent-archive/book-reader/book-reader.js` passed. | Add canonical TOC sidebar behavior before propagating generated assets. |
| 2026-07-30T04:00:13Z | Zyta | Implement | Completed task 1_2; copied reader assets to six generated books, ran `bun run build:site`, and confirmed `br-toc-sidebar` in `dist/site/entrepreneurship/book-reader`. | Ensure local generated output uses the TOC-enabled reader. |
| 2026-07-30T04:03:26Z | Zyta | Implement | Completed task 1_3; `npx playwright test e2e/book-toc-sidebar.spec.ts` passed 2/2. | Verify TOC visibility, current-page state, navigation, and mobile reachability. |
| 2026-07-30T04:07:03Z | Zyta | Verify | Verify gate passed: `bun run build:site`, `npx playwright test` 5/5, and `bun run asm change validate add-book-toc-sidebar`. Type check, lint, and unit test are not defined in `asimov/project.md`. | Confirm build readiness before manual review. |
| 2026-07-30T04:18:37Z | Zyta | Review | Triage round 1: 1 accepted, 0 rebutted. Fixed W1 by converting manifest page entries to current-document-relative TOC hrefs and adding chapter-layout E2E coverage. Re-verified with `node --check agents/agent-archive/book-reader/book-reader.js`, `npx playwright test e2e/book-toc-sidebar.spec.ts` 3/3, `npx playwright test` 6/6, `bun run build:site`, and `bun run asm change validate add-book-toc-sidebar`. | Resolve review warning for nested chapter-layout TOC navigation. |
| 2026-07-30T05:04:57Z | Zyta | Review | Re-review approved with no findings; review summary reports `npm run e2e -- e2e/book-toc-sidebar.spec.ts` passed 3/3. | Close review fix loop before implementation approval. |
| 2026-07-30T07:00:08Z | Zyta | Implement | Added collapsible chapter-group TOC per user feedback, updated spec/tasks, propagated reader assets, and re-verified with `node --check agents/agent-archive/book-reader/book-reader.js`, `npx playwright test e2e/book-toc-sidebar.spec.ts` 4/4, `npx playwright test` 7/7, `bun run build:site`, and `bun run asm change validate add-book-toc-sidebar`. | Match requested collapsible TOC behavior while preserving flat and nested book navigation. |
| 2026-07-30T07:09:54Z | Zyta | Implement | Adjusted TOC chapter clicks to accordion behavior: clicking a closed chapter opens it and closes others; clicking the already-open chapter keeps it open. Re-verified with `node --check agents/agent-archive/book-reader/book-reader.js`, `npx playwright test e2e/book-toc-sidebar.spec.ts` 4/4, `npx playwright test` 7/7, `bun run build:site`, and `bun run asm change validate add-book-toc-sidebar`. | Prevent the table of contents from collapsing when the open chapter header is clicked. |
| 2026-07-30T07:15:32Z | Zyta | Implement | Persisted clicked TOC target through navigation, restored the current page entry on load, opened its chapter, and scrolled the active link into view. Re-verified with `node --check agents/agent-archive/book-reader/book-reader.js`, `npx playwright test e2e/book-toc-sidebar.spec.ts` 5/5, `npx playwright test` 8/8, `bun run build:site`, and `bun run asm change validate add-book-toc-sidebar`. | Keep the active TOC item visible and highlighted after changing chapters. |
| 2026-07-30T07:22:13Z | Zyta | Implement | Bumped reader asset version from `comments-3` to `toc-accordion-1`, updated generated HTML references, rebuilt site output, and re-verified with `npx playwright test e2e/book-toc-sidebar.spec.ts` 5/5, `npx playwright test` 8/8, `bun run build:site`, and `bun run asm change validate add-book-toc-sidebar`. | Force browsers and local dev to load the latest TOC persistence code instead of cached reader assets. |
| 2026-07-30T08:31:05Z | Zyta | Implement | Normalized TOC active-state matching so `.html` and extensionless Pages URLs are equivalent, added extensionless-route E2E coverage, and re-verified with `node --check agents/agent-archive/book-reader/book-reader.js`, `npx playwright test e2e/book-toc-sidebar.spec.ts` 5/5, `npx playwright test` 8/8, `bun run build:site`, and `bun run asm change validate add-book-toc-sidebar`. | Fix active TOC persistence under Wrangler/Pages extensionless URLs like `/entrepreneurship/1-introduction`. |
| 2026-08-01T05:15:20Z | Zyta | Archive | Marked deploy gate skipped because `asimov/project.md` has no concrete Deploy command or smoke test. | Deploy gate is N/A for this repository configuration. |
