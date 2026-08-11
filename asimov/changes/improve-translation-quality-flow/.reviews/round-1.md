# Review: improve-translation-quality-flow (Round 1)

**Date:** 2026-08-08
**Reviewable lines:** ~174 tracked additions plus 2 new script files
**Agents spawned/skipped:** data-security attempted (runtime depth limit), logic attempted (runtime depth limit), contracts attempted (runtime depth limit), frontend not spawned, performance attempted (runtime depth limit)
**Verdict:** BLOCK
**Counts:** BLOCK 1, WARN 2, SUGGEST 0

## Findings

### B1

- **ID:** B1
- **Severity:** BLOCK
- **Confidence:** HIGH
- **Priority:** P1
- **Agent:** chair
- **File:** `agents/agent-review/scripts/translation-quality-check.py:134`
- **Title:** English-leak detector flags normal Vietnamese phrases as blocking errors
- **Evidence:** `find_english_leaks` treats any two ASCII words of length >= 8 as English (`\b[A-Za-z]...`). Common Vietnamese phrases without diacritics, e.g. `Kinh doanh`, match this regex and become `english-leak` errors; a direct invocation of the function returns `['Kinh doanh']` for `Kinh doanh là một hoạt động quan trọng.`
- **Impact:** The new deterministic QA gate can fail clean Vietnamese translations, forcing unnecessary waivers or blocking semantic review/export for normal textbook content.
- **SuggestedFix:** Do not classify arbitrary ASCII word pairs in Vietnamese text as English. Prefer source-anchored leak detection (compare against English source n-grams), require stronger English signals, or maintain an explicit English/proper-noun detector with Vietnamese-safe exclusions before emitting blocking errors.
- **Status:** accepted
- **Triage:** Accepted. This violates `specs/translation-quality/spec.md#requirement-deterministic-quality-gate` because normal Vietnamese ASCII phrases must not become blocking English-leak errors. Fix with source-anchored leak detection.

### W1

- **ID:** W1
- **Severity:** WARN
- **Confidence:** HIGH
- **Priority:** P2
- **Agent:** chair
- **File:** `agents/agent-translate/scripts/translate.js:175`
- **Title:** Translation prompts omit allowlist guidance from termbase
- **Evidence:** `applicableTermbaseLines` emits only `HARD`, `SOFT`, and `PROTECT` lines, then returns those lines at 191. `termbase.allowlist` is never included in the prompt even though the spec requires applicable hard terms, soft phrases, protected terms, and allowlist guidance before translating.
- **Impact:** Translators do not know which English terms are intentionally allowed to remain, increasing drift between translation output and the deterministic QA allowlist.
- **SuggestedFix:** Include bounded applicable `ALLOW` lines from `termbase.allowlist` (or a concise allowlist rule) alongside protected terms in both block and fallback prompt paths.
- **Status:** accepted
- **Triage:** Accepted. This violates `specs/translation-quality/spec.md#requirement-translation-termbase-consumption` because prompt context must include allowlist guidance as well as hard/soft/protected terms. Fix by emitting bounded `ALLOW` lines.

### W2

- **ID:** W2
- **Severity:** WARN
- **Confidence:** HIGH
- **Priority:** P2
- **Agent:** chair
- **File:** `agents/agent-review/scripts/translation-quality-check.py:282`
- **Title:** File-target CLI still defaults to Entrepreneurship instead of deriving the book
- **Evidence:** `parse_args` rewrites a single `.html` argument to `args.target = args.book` and `args.book = "entrepreneurship"` (lines 289-291). This does not derive the book from the translated file path for future book files.
- **Impact:** Running QA on a future book by file path can load the wrong Entrepreneurship termbase or fail to find the intended one, violating the book-reuse requirement and producing misleading QA results.
- **SuggestedFix:** When the first argument is an HTML path, infer the book directory/name from the path (for example by walking up to the book root containing `termbase.json`) instead of hard-defaulting to Entrepreneurship; keep an explicit legacy default only for chapter/all shorthand.
- **Status:** accepted
- **Triage:** Accepted. This violates `specs/translation-quality/spec.md#requirement-book-reuse` because file-path QA must derive the book/termbase instead of defaulting to Entrepreneurship. Fix by walking up from the HTML file to a directory containing `termbase.json`.

## Notes

- Specialist spawning was attempted through the runtime task primitive but failed with `Subagent depth limit reached (1)`, so this round contains chair findings only.
- Verification commands run: `python3 agents/agent-review/scripts/translation-quality-check.py --help`, `node agents/agent-analyze/scripts/build-termbase.js --help`, `python3 agents/agent-review/scripts/start-review-round.py --help`, plus a direct function check for the English-leak regex.
