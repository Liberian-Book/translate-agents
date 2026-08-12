# Workflow State: add-reader-book-page

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
- [ ] 5. Review _(manual — user runs `/asimov-review-start`; skip for trivial or doc/design-only)_:
  - [ ] Code Review
- [x] 6. Findings triage: accept/rebut each finding with rationale
- [/] 7. Review Fix Loop _(max 3 rounds — fix, re-verify, re-review)_
- [ ] 8. Validation
  - [ ] **Gate: user approved implementation**
  - [ ] Extract knowledge

## Archive

- [ ] Deploy Gate _(skip if `asimov/project.md` § Commands → Deploy is N/A)_:
  - [ ] Run deploy command
  - [ ] Run smoke test
- [ ] Apply deltas: `bun run asm change apply`
- [ ] Archive change: `bun run asm change archive`
- [ ] Commit all changes

## Notes

- Complexity: standard — new reader UI spans routing/page layout, book content loading, and TOC behavior with multiple design trade-offs.
- Escalation flags: none
- Change ID: add-reader-book-page

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-08-11T08:17:27Z | Zyta | Context + Triage | Created change scaffold and recorded standard complexity. | Required Stage 1 setup for planning. |
| 2026-08-11T08:22:22Z | Zyta | Discovery | Added discovery findings, options, gaps, and risks. | Prepare Gate 1 direction decision. |
| 2026-08-11T08:25:45Z | Zyta | Artifact Generation | Recorded Gate 1 approval for `/<book>/` reuse and added proposal, spec, design, and tasks. | Complete planning artifacts for validation. |
| 2026-08-11T08:26:29Z | Zyta | Validation | `bun run asm change validate add-reader-book-page` passed. | Confirm artifacts are structurally valid before Gate 2. |
| 2026-08-11T08:27:00Z | Zyta | Validation | Recorded Gate 2 approval; skipped Oracle because user did not request it. | Mark plan ready for implementation handoff. |
| 2026-08-11T08:52:58Z | Zyta | Implement | Completed task 1_1; `node --check` passed for canonical and generated reader JS, and `npx playwright test e2e/site-books.spec.ts --grep "chapter-layout book redirects"` passed. | Verify two-panel reader assets load without syntax/runtime smoke regressions. |
| 2026-08-11T08:55:24Z | Zyta | Implement | Completed task 1_2; `npx playwright test e2e/site-books.spec.ts` passed 5/5 after adding reader layout coverage. | Verify reader root/page, TOC navigation, translated-only visibility, no third panel, and mobile TOC behavior. |
| 2026-08-11T08:56:06Z | Zyta | Implement | Completed task 1_3; `npm run build:site` passed, `books.json` contains `/entrepreneurship/`, and `dist/site/entrepreneurship/index.html` redirects to `1-introduction.html`. | Verify static site assembly still serves generated reader roots. |
| 2026-08-11T08:57:47Z | Zyta | Verify | Verify gate completed: `node --check` passed for both reader JS files, `bun run asm change validate add-reader-book-page` passed, `npm run build:site` passed, and `npm run e2e -- e2e/site-books.spec.ts` passed 5/5. Type check, lint, and unit test commands are N/A because `asimov/project.md` still contains placeholders. | Confirm implementation is ready for manual code review. |
| 2026-08-11T09:04:13Z | Zyta | Review Triage | Triage round 1: 1 accepted, 0 rebutted. Details: `.reviews/round-1.md`. | Accept mobile TOC focusability warning for fix. |
| 2026-08-11T09:06:12Z | Zyta | Artifact Sync | User approved expanding task 1_1 scope to all tracked generated book reader assets after `npm run build:site` refreshed them. | Keep canonical and generated reader assets consistent across all checked-in books. |
| 2026-08-11T09:18:01Z | Zyta | Review Fix | Fixed accepted W1 with closed mobile TOC `inert`, `aria-hidden`, and fallback `tabindex=-1`; `npm run e2e -- e2e/site-books.spec.ts` passed 5/5 and `bun run asm change validate add-reader-book-page` passed. | Remove offscreen closed drawer from keyboard/accessibility navigation. |
| 2026-08-11T18:09:39Z | Zyta | Artifact Sync | User changed contract to maintain two pages per book: reader at `/<book>/` and reviewer at `/<book>/review/`; updated specs/design/tasks accordingly. | Preserve old comment/source reviewer workflow while keeping reader translated-only. |
| 2026-08-11T18:09:39Z | Zyta | Implement | Added `book-reviewer` assets, updated `build-preview.py` to generate `review/` subtrees, regenerated 6 books with reviewer routes, and added reviewer E2E coverage. | Implement reader/reviewer split for every generated book. |
| 2026-08-11T18:09:39Z | Zyta | Verify | `node --check` passed for canonical and generated reviewer JS, `python3 -m py_compile agents/agent-archive/scripts/build-preview.py` passed, `npm run e2e -- e2e/site-books.spec.ts` passed 6/6, `bun run asm change validate add-reader-book-page` passed, and `npm run build:site` passed. | Confirm changed route contract and generated output are valid. |
| 2026-08-11T18:19:28Z | Zyta | Bug Fix | Added compatibility redirects for `/<book>/<page>/review/` to `/<book>/review/<page>.html`; `npm run e2e -- e2e/site-books.spec.ts` passed 7/7. | Fix broken CSS/assets when page-specific review URLs are opened directly. |
| 2026-08-11T19:10:23Z | Zyta | Implement | Added homepage Review links for each book card, updated homepage styling and E2E; `npm run e2e -- e2e/site-books.spec.ts` passed 7/7, `npm run build:site` passed, and `bun run asm change validate add-reader-book-page` passed. | Let users access reviewer pages from the homepage. |
| 2026-08-11T19:26:10Z | Zyta | UI Fix | Centered reader shell at 1280px max-width, reduced TOC width to 300px, and removed auto-centering/padded whitespace from article content; `npm run e2e -- e2e/site-books.spec.ts` passed 7/7. | Keep TOC and book content adjacent in the middle of wide screens. |
| 2026-08-11T19:30:38Z | Zyta | Scope Correction | Moved Review access from homepage cards into reader pages and updated specs/tasks to match; `npm run e2e -- e2e/site-books.spec.ts` passed 8/8, `npm run build:book && npm run build:site` passed, and `bun run asm change validate add-reader-book-page` passed. | User clarified Review belongs in the book reader page, not homepage. |
