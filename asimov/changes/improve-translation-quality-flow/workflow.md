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
  - [x] Code Review
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

- Change ID: `improve-translation-quality-flow`.
- Complexity: standard. Reason: affects the translation pipeline, glossary enforcement, review behavior, and future-book reuse, with quality gates spanning multiple scripts/docs.
- Escalation flags: cross-stage workflow change; design artifact required to define where glossary seeding, phrase enforcement, QA, and failure handling belong.
- Gate 1: user approved Option B, termbase plus deterministic QA gates.
- Build scope correction: current workspace stores book data at `../web-site/entrepreneurship`; new quality scripts resolve `data/<book>`, `../<book>`, then `../web-site/<book>` to avoid new single-book hardcoding.

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-08-08T09:01:24Z | Zyta | Context + Triage | Created change scaffold and recorded standard complexity. | User requested a planning change for translation-flow quality issues across current and future books. |
| 2026-08-08T09:01:24Z | Zyta | Discovery | Completed delegated discovery and wrote `discovery.md`. | Identify translation-flow gaps before choosing implementation direction. |
| 2026-08-08T09:01:24Z | Zyta | Artifact Generation | Added proposal, translation-quality spec, design, and tasks. | Convert approved direction into builder-ready planning artifacts. |
| 2026-08-08T09:15:51Z | Zyta | Validation | `bun run asm change validate improve-translation-quality-flow` passed. | Confirm artifact format before approval gate. |
| 2026-08-08T09:18:45Z | Zyta | Validation | Gate 2 approved; oracle review skipped because user approved without requesting it. | Complete plan workflow and prepare implementation handoff. |
| 2026-08-08T09:38:53Z | Zyta | Implement | Completed 1_1 and 1_2; generated `../web-site/entrepreneurship/termbase.json` with seeded hard terms. | Establish book-scoped termbase readiness before translation. |
| 2026-08-08T09:40:01Z | Zyta | Implement | Completed 2_1; `node agents/agent-translate/scripts/translate.js --help` passed. | Translation prompts now consume applicable termbase entries. |
| 2026-08-08T09:43:10Z | Zyta | Implement | Completed 3_1; `python3 agents/agent-review/scripts/translation-quality-check.py --help` passed and a dry run found blocking issues in existing output. | Add deterministic termbase/English-leak QA gate. |
| 2026-08-08T09:44:05Z | Zyta | Implement | Completed 3_2; `python3 agents/agent-review/scripts/start-review-round.py --help` passed. | Semantic review now warns when translation-quality PASS/WAIVED evidence is missing. |
| 2026-08-08T09:45:25Z | Zyta | Implement | Completed 4_1; docs updated and stale `book-reader/skills/skill-translate.md` scope corrected to active translation skill path. | Document future-book termbase and deterministic QA gates. |
| 2026-08-08T09:46:04Z | Zyta | Verify | Narrow checks passed: JS syntax checks, Python compile, termbase generation, translate help, QA help, review-round help, and Asimov validation. | Root project commands are placeholders/N/A, so verify changed scripts directly. |
| 2026-08-08T09:52:50Z | Zyta | Review | Triage round 1: 3 accepted, 0 rebutted. Fixed B1/W1/W2 and re-ran narrow verify gate successfully. Details: `.reviews/round-1.md`. | Address blocking review findings before re-review. |
