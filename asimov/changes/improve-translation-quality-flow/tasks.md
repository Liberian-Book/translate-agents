## 1. Termbase Preparation

- [x] 1_1 Add book-scoped termbase builder
  - **Deps**: none
  - **Refs**: specs/translation-quality/spec.md#requirement-book-scoped-termbase; design.md D1; design.md D2; docs/research/20260808-translation-quality-gates.md
  - **Scope**: agents/agent-analyze/scripts/build-termbase.js, agents/agent-analyze/skills/skill-glossary-extraction.md, package.json
  - **Acceptance**:
    - Outcome: A command can generate a book-scoped termbase JSON with `hardTerms`, `softPhrases`, `protectedTerms`, and `allowlist` from the approved glossary.
    - Verify: manual run `node agents/agent-analyze/scripts/build-termbase.js entrepreneurship`
  - **Plan**:
    1. Add `build-termbase.js` that accepts `bookName`, resolves `../<bookName>/glossary.csv`, and writes `../<bookName>/termbase.json`.
    2. Parse existing glossary columns defensively and classify phrase entries by spaces/casing while supporting explicit future metadata columns if present.
    3. Add a package script alias only if it matches existing package.json command style.
    4. Update extraction skill docs to state that glossary approval must be followed by termbase generation.

- [x] 1_2 Seed current Entrepreneurship terminology examples
  - **Deps**: 1_1
  - **Refs**: specs/translation-quality/spec.md#scenario-known-entrepreneurship-terms; design.md D2
  - **Scope**: ../web-site/entrepreneurship/glossary.csv
  - **Acceptance**:
    - Outcome: The approved Entrepreneurship glossary includes entries for `franchise`, `franchisee`, `Types of Entrepreneurs`, and `calculated risk` with Vietnamese targets suitable for enforcement.
    - Verify: manual run `node agents/agent-analyze/scripts/build-termbase.js entrepreneurship`
  - **Plan**:
    1. Inspect existing rows first and update or append only missing/incorrect approved entries.
    2. Prefer hard enforcement for `franchise`, `franchisee`, and `calculated risk`; treat `Types of Entrepreneurs` as hard only if the glossary target is an exact heading translation.
    3. Regenerate the termbase and confirm the known examples appear in the generated JSON.

## 2. Translation Consumption

- [x] 2_1 Load termbase in the translation script
  - **Deps**: 1_1
  - **Refs**: specs/translation-quality/spec.md#requirement-translation-termbase-consumption; design.md D1; design.md D2; design.md D5
  - **Scope**: agents/agent-translate/scripts/translate.js, agents/agent-translate/skills/skill-translate.md
  - **Acceptance**:
    - Outcome: Translation prompts include applicable termbase entries for the current book/file without requiring Entrepreneurship-specific code paths.
    - Verify: manual run `node agents/agent-translate/scripts/translate.js --help`
  - **Plan**:
    1. Add termbase loading near existing approved glossary loading and derive `bookName` from CLI input or translated file path where possible.
    2. Filter hard/soft/protected entries to the current source fragment before prompt construction to keep prompts bounded.
    3. Inject a concise terminology section into block and plain-text fallback prompts.
    4. Update translation skill docs with hard-term, soft-phrase, protected-term, and allowlist rules.

## 3. Deterministic Quality Gate

- [x] 3_1 Add translation quality checker
  - **Deps**: 1_1
  - **Refs**: specs/translation-quality/spec.md#requirement-deterministic-quality-gate; specs/translation-quality/spec.md#scenario-mixed-bilingual-fragment; design.md D3; design.md D4; docs/research/20260808-translation-quality-gates.md
  - **Scope**: agents/agent-review/scripts/translation-quality-check.py, agents/agent-review/skills/skill-glossary-check.md
  - **Acceptance**:
    - Outcome: A QA command reports segment-level blocking issues for missing required terms, source echoes, untranslated English leakage, and mixed bilingual fragments.
    - Verify: manual run `python3 agents/agent-review/scripts/translation-quality-check.py --help`
  - **Plan**:
    1. Implement a CLI accepting `bookName` plus a translated file, chapter number, or `all`, following existing review script path conventions.
    2. Parse bilingual HTML and inspect only Vietnamese visible blocks, preserving block IDs/file names in issue output.
    3. Load `../<bookName>/termbase.json`, strip protected/allowlisted tokens, and emit non-zero exit for error issues.
    4. Document how this checker complements the existing glossary checker rather than replacing it.

- [x] 3_2 Wire QA gate into review flow
  - **Deps**: 3_1
  - **Refs**: specs/translation-quality/spec.md#requirement-review-and-export-gate; design.md D4
  - **Scope**: agents/agent-review/agent-review.md, agents/agent-review/skills/skill-review.md, agents/agent-review/scripts/start-review-round.py
  - **Acceptance**:
    - Outcome: Starting or documenting a semantic review round requires clean translation QA output or an explicit waiver recorded with the review context.
    - Verify: manual run `python3 agents/agent-review/scripts/start-review-round.py --help`
  - **Plan**:
    1. Update review docs so translation-quality check runs after integrity/glossary checks and before semantic review.
    2. Add a non-destructive guard or warning in `start-review-round.py` when no clean QA report/waiver is present.
    3. Preserve append-only review file creation and avoid overwriting existing review rounds.

## 4. Workflow Documentation

- [x] 4_1 Update operator workflow for future books
  - **Deps**: 3_2
  - **Refs**: specs/translation-quality/spec.md#requirement-book-reuse; design.md D5
  - **Scope**: workflow/master-workflow.md, AGENTS.md, agents/agent-translate/skills/skill-translate.md
  - **Acceptance**:
    - Outcome: The documented flow tells operators to approve glossary terms, build the termbase, translate with terminology context, run deterministic QA, and only then review/export.
    - Verify: none — docs-only
  - **Plan**:
    1. Insert the termbase generation step after glossary approval in the master workflow.
    2. Insert translation-quality QA as a blocker before semantic review and export/archive completion.
    3. Update shared translation rules so future books use hard terms, soft phrases, protected terms, and allowlists consistently.
