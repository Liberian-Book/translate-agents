## 1. Guided Chapter Selection

- [x] 1_1 Tighten all-vs-specific chapter prompt normalization
  - **Deps**: none
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-guided-chapter-choice-after-cleanup; specs/guided-chapter-selection/spec.md#requirement-all-chapters-option; specs/guided-chapter-selection/spec.md#requirement-specific-selections-are-not-masked-by-all; docs/research/20260717-node-cli-stack.md
  - **Scope**: src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: In the guided OpenStax translate flow, users can choose all chapters or specific detected chapters after cleanup, and specific chapter selections are not accidentally overridden by the all-chapters sentinel.
    - Verify: manual `node --check src/cli/interactive.mjs`
  - **Plan**:
    1. Update `selectChaptersForTranslation` result normalization so an explicit set of chapter selections resolves predictably instead of silently translating all.
    2. Preserve the all-chapters option and existing fallback to all when no chapters are detected.
    3. Keep existing `@inquirer/prompts` checkbox/cancel conventions intact.

- [x] 1_2 Preserve selected-chapter scoping across downstream steps
  - **Deps**: 1_1
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-specific-chapter-selection; specs/guided-chapter-selection/spec.md#requirement-chapter-detection-fallback; specs/guided-chapter-selection/spec.md#requirement-existing-output-is-not-pruned
  - **Scope**: src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: Selected chapters continue to scope term extraction, prep, text translation, and image translation; selecting all continues to process every clean HTML file; no cleanup/prune behavior is added.
    - Verify: manual `node --check src/cli/interactive.mjs`
  - **Plan**:
    1. Confirm `selectedChapters` is passed consistently to term extraction, `prepareCleanFiles`, per-file text translation, and image translation.
    2. Keep `listChapterHtmlFiles` and `getChapterFromHtmlFile` behavior unchanged unless needed for the all-vs-specific fix.
    3. Do not add direct `translate text` command chapter support or any deletion of existing translated output.

- [x] 1_3 Make guided image review handling non-blocking
  - **Deps**: 1_2
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-guided-image-review-items-do-not-abort-pipeline
  - **Scope**: src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: Guided interactive image translation no longer fails the whole pipeline solely because `translate-images.js` reports review items; the script warning remains visible and later build/upload steps can continue.
    - Verify: manual `node --check src/cli/interactive.mjs`
  - **Plan**:
    1. Remove strict image-translation failure mode from guided interactive image translation calls while preserving renderer selection and existing script output.

- [x] 1_4 Prompt before rescraping existing raw book data
  - **Deps**: 1_3
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-existing-scraped-data-prompt; specs/guided-chapter-selection/spec.md#requirement-skip-scrape-preserves-downstream-flow
  - **Scope**: src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: When `data/<book>/raw` already contains scraped HTML, the guided flow asks whether to skip scraping or scrape again; skipping scrape still continues cleanup and all later steps.
    - Verify: manual `node --check src/cli/interactive.mjs`
  - **Plan**:
    1. Add a small helper that detects existing scraped raw HTML in `data/<book>/raw`.
    2. Before the scrape step, prompt with `select` to skip or scrape again when existing raw data is detected.
    3. If skipped, do not run `skill-scrape.js`; still render progress and continue to cleanup.

- [x] 1_5 Compact cleanup progress output
  - **Deps**: 1_4
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-cleanup-progress-is-compact
  - **Scope**: agents/agent-scrape/scripts/skill-cleanup.js
  - **Acceptance**:
    - Outcome: Cleanup normal output shows a concise start message and progress indicator instead of emitting a separate line for every downloaded image and cleaned file.
    - Verify: manual `node --check agents/agent-scrape/scripts/skill-cleanup.js`
  - **Plan**:
    1. Replace per-image and per-file `console.log` calls with a progress renderer that updates the current line.
    2. Keep warnings/errors visible on their own lines.
    3. Print a final completion summary after all files are processed.

- [x] 1_6 Prompt before rerunning existing cleaned book data
  - **Deps**: 1_5
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-existing-cleaned-data-prompt; specs/guided-chapter-selection/spec.md#requirement-skip-cleanup-preserves-downstream-flow
  - **Scope**: src/cli/interactive.mjs
  - **Acceptance**:
    - Outcome: When `data/<book>/clean` already contains cleaned HTML, the guided flow asks whether to skip cleanup or run cleanup again; skipping cleanup still continues chapter selection and all later steps.
    - Verify: manual `node --check src/cli/interactive.mjs`
  - **Plan**:
    1. Reuse the local HTML detection helper for `cleanDir`.
    2. Before the cleanup step, prompt with `select` to skip or rerun cleanup when existing clean data is detected.
    3. If skipped, do not run `skill-cleanup.js`; still render progress and continue to chapter selection.

- [x] 1_7 Capture noisy guided child script output
  - **Deps**: 1_6
  - **Refs**: specs/guided-chapter-selection/spec.md#requirement-guided-pipeline-child-logs-are-compact; specs/guided-chapter-selection/spec.md#requirement-image-translation-summary-remains-visible
  - **Scope**: src/cli/interactive.mjs, src/cli/lib/run-script.mjs
  - **Acceptance**:
    - Outcome: Guided book translation steps show compact title/progress output instead of streaming noisy child script logs; failed child scripts still expose captured stdout/stderr; image review/error summaries remain visible.
    - Verify: manual `node --check src/cli/interactive.mjs && node --check src/cli/lib/run-script.mjs`
  - **Plan**:
    1. Extend `runScript` with a captured-output mode that returns stdout/stderr on success and attaches them on failure.
    2. Use captured-output mode for guided pipeline child script calls in `interactive.mjs`.
    3. Parse image translation completion output for review/error counts and print a concise warning summary.
    4. Keep direct CLI command wrappers unchanged so manual commands can still stream detailed logs.
