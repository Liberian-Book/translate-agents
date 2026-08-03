# Review: add-chapter-selection-to-translate-flow (Round 1)

- Date: 2026-08-03
- Reviewable lines: 612 added / 625 removed (51 files)
- Agents spawned/skipped: data-security not-spawned; logic attempted but runtime depth limit; contracts attempted but runtime depth limit; frontend attempted but runtime depth limit; performance not-spawned
- Verdict: BLOCK
- Counts: BLOCK 2 | WARN 0 | SUGGEST 0

## Findings

### B1

- ID: B1
- Severity: BLOCK
- Confidence: HIGH
- Priority: P1
- Agent: chair
- File: `apps/web-site/books/business-ethics/1-introduction.html:41`
- Title: Visible placeholder tokens leaked into rendered Vietnamese content
- Evidence: Changed rendered HTML now contains `__HTML_TAG_0__Dàn bài chương__HTML_TAG_1__`; grep also finds placeholder tokens in `10-introduction.html`, `10-1-more-telecommuting-or-less.html`, `1-2-ethics-and-profitability.html`, and `7-2-loyalty-to-the-brand-and-to-customers.html`.
- Impact: Users will see internal translation placeholders instead of clean Vietnamese text/inline markup on published book pages.
- SuggestedFix: Revert or regenerate the affected static HTML so placeholder sentinels are restored to real markup/text before including these files.
- Status: accepted
- Triage: Accepted. Resolved for this change by restoring out-of-scope generated Business Ethics static HTML changes to `HEAD`; current diff no longer includes these generated files.

### B2

- ID: B2
- Severity: BLOCK
- Confidence: HIGH
- Priority: P1
- Agent: chair
- File: `apps/web-site/books/world-history-volume-1/assets/translated/img-1-2-6.vi.png`
- Title: Current diff includes out-of-scope published book artifact churn and deletes a translated asset
- Evidence: The proposal scopes the change to `src/cli/interactive.mjs` chapter-selection normalization and explicitly excludes pruning existing translated/built output. The working tree changes 50 static book artifact files and deletes `apps/web-site/books/world-history-volume-1/assets/translated/img-1-2-6.vi.png`, while changing its metadata `outputImage` to `null`.
- Impact: Approving this change would ship unrelated content/site mutations and remove a previously published translated image asset under a CLI prompt-only change, making the implementation diverge from the reviewed intent.
- SuggestedFix: Revert all generated/static book artifact changes from this change, or split them into a separate reviewed change with explicit intent and validation.
- Status: accepted
- Triage: Accepted. Resolved by restoring out-of-scope World History static artifact changes and the deleted translated PNG to `HEAD`; current diff is limited to the CLI change plus Asimov artifacts.

## Notes

- Chair self-review found no defect in the localized `selectChaptersForTranslation` normalization: all-plus-specific returns the specific sorted chapter list; only-all returns `all`; downstream callers still receive either `all` or an array.
- Specialist spawning was attempted per workflow, but the runtime refused nested tasks with `Subagent depth limit reached (1)`. Findings above are chair findings from the full diff.
