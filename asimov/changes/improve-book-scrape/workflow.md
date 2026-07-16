# Workflow State: <change-id>

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
  - [-] E2E
- [ ] 5. Review _(manual — user runs `/asimov-review-start`; skip for trivial or doc/design-only)_:
  - [ ] Code Review
- [ ] 6. Findings triage: accept/rebut each finding with rationale
- [ ] 7. Review Fix Loop _(max 3 rounds — fix, re-verify, re-review)_
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

- Change ID: `improve-book-scrape`.
- Complexity: standard. The scraper behavior change affects external site discovery, Puppeteer interaction, generated filesystem outputs, and validation/retry behavior.
- Escalation flags: external dependency/API behavior (OpenStax DOM/TOC), flow/state change. Design artifact required.
- Project metadata is currently sparse; planning relies on repository discovery and existing agent scripts.
- Gate 1 approved direction: plan-first update to existing `skill-scrape.js`; preserve CLI and `data/<bookName>/raw`; add `scrape-plan.json` and `scrape-state.json`.

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-07-16T17:04:05Z | OpenCode | Context + Triage | Created change and classified complexity as standard | Full-book scrape requires discovery, design, specs, and executable task planning |
| 2026-07-16T17:07:59Z | OpenCode | Discovery | Added `discovery.md` with findings, gaps, options, and risks | Gate 1 needs an approved implementation direction before artifacts are generated |
| 2026-07-16T18:30:00Z | OpenCode | Artifact Generation | Added proposal, full-book scrape spec, design, and builder tasks | Approved direction needs implementable artifacts for the build phase |
| 2026-07-16T18:31:48Z | OpenCode | Validation | Ran `bun run asm change validate improve-book-scrape`; validation passed | Confirm artifacts meet Asimov structural requirements before Gate 2 |
| 2026-07-16T18:41:16Z | OpenCode | Validation | Gate 2 approved; oracle review skipped | User approved plan for build handoff |
| 2026-07-16T20:10:09Z | OpenCode | Implement | Completed tasks 1_1, 1_2, and 2_1; scrape verified 170 planned pages, 170 raw files, chapter 2/15 present, 0 off-book URLs | Full-book scrape plan, state tracking, and verification acceptance passed |
| 2026-07-16T20:10:41Z | OpenCode | Verify Gate | Ran `node --check agents/agent-scrape/scripts/skill-scrape.js` and `bun run asm change validate improve-book-scrape`; both passed. Marked project typecheck/lint/test/E2E N/A because `asimov/project.md` defines no real commands | Verify implementation before manual code review gate |
