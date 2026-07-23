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
- [ ] 1. Read all change artifacts that exist (workflow.md, specs/, proposal.md, design.md, tasks.md)
- [ ] 2. Execute tasks sequentially in dependency order
- [ ] 3. Update: mark `- [x]` in tasks.md + log in Revision Log after EACH task
- [ ] 4. Verify Gate — run commands from `asimov/project.md` § Commands, **MUST execute and observe pass** _(mark `[-]` if N/A)_:
  - [ ] Type check
  - [ ] Lint
  - [ ] Test
  - [ ] E2E
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

- 2026-07-23: Change id `build-static-book-deploy` selected. Complexity: standard. Escalation flags: build/deploy pipeline changes, generated artifact layout, homepage data contract. User direction: `apps/web-site/entrepreneurship` must not become source of truth; generated books are copied into final deploy folder; homepage reads manifest/API with book URLs; start with `books.json`, D1 API later.

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-07-23T05:31:00Z | Zyta | Context + Triage | Initialized `build-static-book-deploy` and classified it as standard. | Establish plan workspace and record user constraints before discovery. |
| 2026-07-23T05:35:50Z | Zyta | Discovery | Added discovery findings, gap analysis, options, and risks. | Capture current pipeline gaps before selecting plan direction. |
| 2026-07-23T05:38:30Z | Zyta | Artifact Generation | Added proposal, three capability specs, design, and implementation tasks. | Convert approved direction into builder-ready plan artifacts. |
| 2026-07-23T05:39:26Z | Zyta | Validation | `bun run asm change validate build-static-book-deploy` passed after adding E2E smoke task. | Satisfy plan validator and proposal E2E requirement. |
| 2026-07-23T05:43:21Z | Zyta | Gate 2 | User approved the validated plan; oracle review skipped because it was not requested. | Mark plan ready for implementation. |
