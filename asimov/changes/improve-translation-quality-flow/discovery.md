# Discovery: improve-translation-quality-flow

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Architecture Snapshot | Done | finder subagent mapped translation, review, glossary, and archive scripts |
| Internal Patterns | Done | finder subagent mapped bilingual block rules, review history, and existing Asimov specs |
| External Research | Done | librarian subagent persisted `docs/research/20260808-translation-quality-gates.md` |
| Constraint Check | Done | project commands and repo conventions confirm no root test/lint/typecheck; verify changed scripts narrowly |

## Key Findings

### 1. Existing Flow Has Glossary Support, But It Is Not A Hard Pre-Translation Contract

The current flow already has glossary extraction, translation rules, a translate script, glossary QA, semantic review rounds, and apply-review support. The key files are `agents/agent-analyze/scripts/term-extract.js`, `agents/agent-translate/skills/skill-translate.md`, `agents/agent-translate/scripts/translate.js`, `agents/agent-review/scripts/glossary-check.py`, `agents/agent-review/scripts/start-review-round.py`, and `agents/agent-translate/scripts/apply-review-fixes.py`.

The issue examples point to missing or weak terminology coverage: single terms such as `franchise` and `franchisee`, phrase-level headings such as `Types of Entrepreneurs`, and mixed-language duplicates such as `calculated risk rủi ro`. Existing glossary rules can catch some approved-term mismatches after the fact, but the flow does not require a book/chapter termbase to be complete enough before translation starts.

### 2. Phrase-Level Terms Need First-Class Handling

Research and repo discovery both show that phrase entries need explicit treatment. A glossary that contains only head nouns will not reliably fix headings or domain phrases. Future books need a repeatable termbase step that supports words, phrases, casing variants, singular/plural forms, and protected non-translatable items.

### 3. The QA Loop Should Fail Before Human Review And Export

The repo already uses an append-only semantic review flow and has a glossary checker. The gap is that deterministic quality gates are not clearly placed as blockers for translation completion. A future-proof flow should fail before review/export when it finds untranslated English leakage, forbidden source terms, expected Vietnamese term absence, or mixed fragments such as `English + Vietnamese` in one target segment.

### 4. Book Reuse Requires Removing Single-Book Assumptions From Quality Inputs

Repo conventions note that several scripts are hardcoded to `../entrepreneurship` or OpenStax Entrepreneurship. This change does not need to complete full multi-book scrape support, but the translation-quality plan should avoid adding more Entrepreneurship-only assumptions. New terminology and QA inputs should be book-scoped by `bookName` and default to the current Entrepreneurship path only when required by existing CLI behavior.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Glossary extraction | Candidate extraction and approved glossary CSV | A mandatory termbase readiness step before translation | Missing fail/approve gate for known domain words and phrases |
| Translation prompts | Glossary-first rules and some built-in QA style guidance | Generated prompt context from approved hard terms, soft phrases, protected terms, and allowlists | Prompt can proceed with incomplete or ambiguous terminology |
| Phrase enforcement | Term matching checks mostly around glossary entries | First-class phrase entries such as `Types of Entrepreneurs` | Phrase headings can remain untranslated or inconsistent |
| Mixed-language detection | Leftover-English validation exists in translate script; glossary checker exists after translation | Deterministic segment-level QA for untranslated English, source echoes, and bilingual duplicate fragments | Bad mixed output can survive until manual review or export |
| Review loop | Append-only review rounds and apply-review script | Automated QA must be clean or explicitly waived before review round starts | Reviewers spend time finding deterministic failures |
| Future books | Some bookName arguments exist; several scripts are Entrepreneurship-hardcoded | Book-scoped termbase and QA configs that do not add new hardcoding | Quality improvements could accidentally remain single-book only |

## Options

### Option A — Strengthen Review Only

Update review prompts/checklists to call out untranslated terms, phrase-level headings, and mixed fragments. This is smallest but leaves the same failures in generated files until human reviewers catch them.

### Option B — Add Deterministic Termbase And QA Gates (Recommended)

Introduce a planned flow where each book/chapter prepares a versioned termbase before translation, translation consumes that termbase, and automated QA blocks review/export on missing required translations, untranslated English leakage, and bilingual fragments. This directly addresses the reported examples and improves future-book reuse without requiring a full scrape architecture rewrite.

### Option C — Replace The Translation Backend With Vendor Glossaries

Adopt a translation provider feature such as DeepL/Google/Amazon glossary resources. This may help terminology enforcement, but it adds dependency and credential complexity, and still needs local QA checks for duplicate bilingual fragments and source echoes.

## Risks

1. **False positives on English leakage** — Proper nouns, acronyms, URLs, code, and protected book/source terms can be flagged incorrectly. Mitigation: require an allowlist/protected-term input and strip markup/placeholders before scanning prose.
2. **Over-rigid glossary enforcement can harm Vietnamese fluency** — Some terms need contextual variation. Mitigation: separate hard terms from soft phrases and make only hard terms exact-match blockers.
3. **Future-book scope can grow into full pipeline generalization** — Existing scrape/analyze scripts have single-book assumptions. Mitigation: scope this change to quality inputs and gates, preserving existing CLI behavior while avoiding new hardcoding.
4. **Retrofitting current Entrepreneurship output may be large** — The book can have many existing bad segments. Mitigation: plan tooling that reports segment-level issues so fixes can be applied chapter by chapter.
