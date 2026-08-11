---
topic: translation-quality-gates
created-by: research for improve-translation-quality-flow translation QA design
date: 2026-08-08
libraries: [Google Cloud Translation, DeepL, Amazon Translate]
used-by: [improve-translation-quality-flow]
---

# Research: translation-quality-gates

## Answers
- Enforce terminology with a versioned termbase/glossary and treat it as a hard gate, not a suggestion. Use phrase-level entries for domain terms (e.g. `franchisee`, `Types of Entrepreneurs`) and keep variant spellings/casing as explicit entries.
- Add a post-translation QA pass that fails on untranslated English leakage and mixed bilingual fragments. Real-world patterns: strip code blocks/markup first, then scan prose for unexpected Latin-word runs, English headings/table labels, and source-text echoes.
- Gate the review loop: only send output to human review after automated checks pass; if QA fails, route back to retranslation with targeted terminology/context fixes.
- Prefer a “fail closed” workflow with an allowlist for intentional exceptions (proper nouns, acronyms, brand names, code, URLs, placeholders).

## Recommended Approach
- Build a two-tier glossary: **hard terms** (must match exactly) and **soft phrases** (preferred wording but may vary with context). Keep glossary files in git and regenerate the translation resource from source files so changes are reviewable.
- Add a QA stage that checks:
  - untranslated English words/phrases against an allowlist
  - bilingual duplicates (`English + Vietnamese` fragments in one segment)
  - glossary term coverage / forbidden term leakage
  - preservation of code blocks, URLs, placeholders, and markup
- Use surrounding context for ambiguous terms; do not rely on per-segment isolation when the source sentence is too short.

## Core Patterns

### 1) Glossary/termbase enforcement
- Google Cloud Translation glossaries support single words and short phrases; case is case-sensitive by default, and the API returns a separate `glossaryTranslations` result for auditing.
- DeepL glossaries support source→target mappings and are meant for consistency across words and phrases; v3 glossaries are editable/multilingual and are the preferred path.
- Amazon Translate custom terminology uses CSV terminology files and is useful as a portable source-of-truth format for batch workflows.

### 2) Phrase-level terminology
- Put full domain phrases in the glossary, not just head nouns. Example: define `Types of Entrepreneurs` instead of only `entrepreneurs`.
- Include plural/singular and casing variants when the API is case-sensitive or matching is exact.
- Keep “must not translate” items (brand names, institution names, book title fragments) in a separate protected list.

### 3) QA checks for untranslated English + mixed-language fragments
- Strip fenced code blocks, HTML/XML tags, URLs, and placeholders before scanning prose.
- Fail on:
  - English headings/table labels in localized docs
  - long ASCII word runs in Vietnamese text that are not allowlisted
  - duplicated bilingual fragments like `calculated risk rủi ro`
  - untranslated source strings copied verbatim into target text
- Prefer line/segment-level reporting so reviewers can fix exactly one bad phrase without reworking the whole document.

### 4) Review-loop gating
- Stage order that works well:
  1. translate with glossary/context
  2. run deterministic QA
  3. auto-retranslate only the failing segments with extra context or stronger terminology constraints
  4. human review on the remaining exceptions
  5. promote only if QA is clean
- Keep review history append-only so rejected terminology decisions remain traceable.

## Usage Examples
- `openinterpreter/openinterpreter`: locale QA script fails on untranslated English headings/table labels; this is a good model for docs-style gating.
- `prompt-security/clawsec`: QA script preserves fenced code blocks, URLs, inline technical tokens, and non-translatable terms; good template for translation integrity checks.
- `tinyhumansai/openhuman`: CI exits non-zero when unexpected English remains after allowlist filtering; good pattern for hard gating.

## Gotchas & Constraints
- Glossaries are not magic: they do not fix bad segmentation, missing context, or inconsistent source text.
- DeepL notes that `context` is for disambiguation, not instruction-following; use glossaries/style rules for explicit terminology control.
- Google Cloud glossaries have limits (size, term length, stopwords, and resource management). DeepL glossaries also have size/entry constraints and source-language detection caveats.
- Multi-segment translation requests do not automatically share context; short fragments often need extra surrounding text.
- Overly aggressive English-leak detection can false-positive on proper nouns, acronyms, URLs, and code. Those need explicit allowlists.

## Gaps
- No dedicated open-source library was validated for bilingual-fragment detection specific to Vietnamese/OpenStax; the recommended checks are practical heuristics synthesized from existing QA patterns.
- No runtime-specific integration point in the local repo was inspected for where this gate should be inserted.

## Confidence
High — confirmed via official Google Cloud and DeepL documentation plus real-world CI/QA patterns from public repos.
