# Proposal: improve-translation-quality-flow

## Why

The Entrepreneurship translation flow allows untranslated or mistranslated domain terms and mixed bilingual fragments to survive too far into the pipeline. Future books need terminology preparation and deterministic QA gates so recurring issues such as `franchise`, `franchisee`, `Types of Entrepreneurs`, and `calculated risk rủi ro` are caught before review/export.

## Appetite

M (≤3d)

## Scope

### In scope
- Add a book-scoped termbase readiness step that converts approved glossary entries into hard terms, soft phrase entries, protected terms, and English allowlists.
- Seed the current Entrepreneurship glossary/termbase inputs for the known bad examples.
- Update translation prompts/scripts to consume the termbase before generating Vietnamese output.
- Add deterministic QA for required term coverage, untranslated English leakage, source echoes, and mixed bilingual fragments.
- Gate semantic review/export flow documentation on passing automated quality checks or an explicit waiver.

### Out of scope
- Replacing the translation model/provider.
- Full multi-book scrape/link-filter generalization.
- Bulk retranslation of every existing Entrepreneurship chapter.
- Changing DOCX/export rendering behavior beyond documenting the new pre-export gate.

## Capabilities

1. **translation-termbase-readiness** — Prepares book-scoped terminology resources before translation starts.
2. **translation-quality-gates** — Blocks review/export when translated segments contain deterministic terminology or mixed-language failures.
3. **translation-flow-documentation** — Updates operator-facing workflow/rules so future books follow the same quality gates.

## UI Impact & E2E

- **User-visible UI behavior affected?** NO
- **E2E required?** NOT REQUIRED
- **Justification**: This change affects CLI scripts, generated book data, and workflow docs; verification can use targeted script runs on narrow chapter/file inputs.

## Risk Level

MEDIUM — terminology checks can false-positive or over-constrain translation quality, so the design needs explicit hard/soft term separation and allowlists.
