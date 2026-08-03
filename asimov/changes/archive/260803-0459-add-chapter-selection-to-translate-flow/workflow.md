# Workflow State: add-chapter-selection-to-translate-flow

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
  - [-] Fill design.md _(standard or escalation-forced — skip if LOW risk + no escalation flags)_
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

_(Key decisions, blockers, user feedback — persists across compaction)_

- Complexity: small. Localized CLI/interactive flow change; no new dependency, schema, API, auth, storage, or deployment behavior expected.
- Required artifacts: discovery, proposal, one capability spec, tasks. Design can be skipped unless discovery reveals cross-flow risk.
- Gate 1 direction approved: Option A, tighten existing guided checkbox behavior only.
- Design skipped: low risk, no escalation flags, no new interfaces, no data/storage/API architecture changes.

## Revision Log

<!-- Format: YYYY-MM-DDTHH:MM:SSZ (ISO 8601 UTC). Get timestamp: date -u +%Y-%m-%dT%H:%M:%SZ -->
<!-- Author: git user. Get it: git config user.name -->

| DateTime (UTC) | Author | Phase | What Changed | Why |
| -------------- | ------ | ----- | ------------ | --- |
| 2026-08-03T03:05:48Z | Zyta | Plan | Completed context and triage for `add-chapter-selection-to-translate-flow`. | Establish planning scope before code discovery. |
| 2026-08-03T03:08:53Z | Zyta | Discovery | Added discovery findings and options. | Identify existing guided-flow chapter selection behavior and planning gaps. |
| 2026-08-03T03:08:53Z | Zyta | Artifacts | Added proposal, guided chapter selection spec, and implementation tasks; skipped design. | Convert approved direction into builder-ready plan. |
| 2026-08-03T03:10:57Z | Zyta | Validation | `bun run asm change validate add-chapter-selection-to-translate-flow` passed. | Confirm plan artifacts are structurally valid. |
| 2026-08-03T03:17:37Z | Zyta | Gate 2 | User approved the validated plan. | Ready for implementation handoff. |
| 2026-08-03T03:25:50Z | Zyta | Build 1_1 | Updated chapter prompt normalization so specific chapter selections win over the all sentinel; verified with `node --check src/cli/interactive.mjs`. | Prevent accidental full-book translation when users choose specific chapters. |
| 2026-08-03T03:26:29Z | Zyta | Build 1_2 | Verified selected chapters still scope term extraction, prep, text translation, and image translation; verified with grep inspection and `node --check src/cli/interactive.mjs`. | Ensure downstream pipeline behavior remains aligned with chapter choice. |
| 2026-08-03T03:27:17Z | Zyta | Verify Gate | Ran `node --check src/cli/interactive.mjs` and `bun run asm change validate add-chapter-selection-to-translate-flow`; project.md has no defined typecheck/lint/test/E2E commands, so those gates are N/A. | Confirm implementation and planning artifacts are valid before review. |
| 2026-08-03T03:32:33Z | Zyta | Review Round 1 | Triage round 1: 2 accepted, 0 rebutted. Restored out-of-scope generated book artifact diffs; details in `.reviews/round-1.md`. | Resolve blocking review findings by limiting the change to approved CLI scope. |
| 2026-08-03T03:33:36Z | Zyta | Review Fix Loop | User skipped re-review after accepted fixes and re-verification passed. | Proceed to implementation approval gate. |
| 2026-08-03T03:33:36Z | Zyta | Scope Update | User requested guided image translation review items log and continue instead of aborting; added task 1_3 and requirement. | Incorporate new CLI behavior request before archive. |
| 2026-08-03T03:56:59Z | Zyta | Build 1_3 | Removed `--strict` from guided book image-translation calls; verified with `node --check src/cli/interactive.mjs` and `bun run asm change validate add-chapter-selection-to-translate-flow`. | Let image review warnings remain visible without aborting build/upload. |
| 2026-08-03T04:02:16Z | Zyta | Build 1_4 | Added prompt to skip or rerun scrape when `data/<book>/raw` has existing HTML; verified with `node --check src/cli/interactive.mjs` and `bun run asm change validate add-chapter-selection-to-translate-flow`. | Avoid unnecessary rescrape while preserving cleanup and downstream flow. |
| 2026-08-03T04:09:36Z | Zyta | Scope Update | User requested compact cleanup output with title/progress bar instead of 170+ log lines; added task 1_5 and requirement. | Improve guided flow terminal readability for large books. |
| 2026-08-03T04:11:00Z | Zyta | Build 1_5 | Replaced cleanup per-image/per-file logs with a compact progress line and final summary; verified with `node --check agents/agent-scrape/scripts/skill-cleanup.js`, `node --check src/cli/interactive.mjs`, and `bun run asm change validate add-chapter-selection-to-translate-flow`. | Keep cleanup progress readable for large books while preserving warnings/errors. |
| 2026-08-03T04:14:23Z | Zyta | Scope Update | User requested prompt to skip or rerun cleanup when existing cleaned HTML is present; added task 1_6 and requirements. | Avoid unnecessary cleanup/assets download while preserving downstream flow. |
| 2026-08-03T04:15:58Z | Zyta | Build 1_6 | Added prompt to skip or rerun cleanup when `data/<book>/clean` has existing HTML; verified with `node --check src/cli/interactive.mjs`, `node --check agents/agent-scrape/scripts/skill-cleanup.js`, and `bun run asm change validate add-chapter-selection-to-translate-flow`. | Let users avoid repeat cleanup/assets download while preserving chapter selection and later steps. |
| 2026-08-03T04:18:45Z | Zyta | Scope Update | User requested every guided step use title/progress output instead of streaming infinite child logs; added task 1_7 and requirements. | Make guided pipeline output consistently readable across all child scripts. |
| 2026-08-03T04:22:53Z | Zyta | Build 1_7 | Added captured-output mode to `runScript`, routed guided child script calls through compact wrappers, kept image review summary visible, and made progress bars update in-place; verified with `node --check src/cli/interactive.mjs`, `node --check src/cli/lib/run-script.mjs`, `node --check agents/agent-scrape/scripts/skill-cleanup.js`, and `bun run asm change validate add-chapter-selection-to-translate-flow`. | Prevent unbounded child script logs in the guided pipeline while preserving failure diagnostics. |
| 2026-08-03T04:00:56Z | Zyta | Scope Update | User requested prompt to skip or rerun scrape when existing scraped raw data is present; added task 1_4 and requirements. | Avoid unnecessary OpenStax scraping while preserving downstream flow. |
| 2026-08-03T04:59:00Z | Zyta | Archive Deploy Gate | Skipped deploy command and smoke test because `asimov/project.md` does not define a deploy command. | Archive workflow treats missing/N/A deploy as skipped. |
