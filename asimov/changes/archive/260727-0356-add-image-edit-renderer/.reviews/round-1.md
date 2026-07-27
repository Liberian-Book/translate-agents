# Review: add-image-edit-renderer (Round 1)

- Date: 2026-07-27
- Reviewable lines: 495
- Agents spawned/skipped: data-security skipped (runtime subagent depth limit), logic skipped (runtime subagent depth limit), contracts skipped (runtime subagent depth limit), frontend not-spawned (no frontend files), performance skipped (runtime subagent depth limit)
- Verdict: WARN
- Counts: BLOCK 0, WARN 1, SUGGEST 1

## Findings

### W1
- ID: W1
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `agents/agent-translate/scripts/translate-images.js:83`
- Title: Review/error image decisions now make the whole image step fail
- Evidence: The script processes all matched files, prints totals, then throws when `totals.error > 0 || totals.review > 0`. The new fixture README records a real chapter run with `auto=2, skip=0, review=1, error=0` exiting nonzero because of this behavior.
- Impact: A single ambiguous OCR image (`review`) or a conservatively handled per-image error can abort the guided translate pipeline before export/upload, even though the image-level contract says ambiguous/failing images should keep original references unchanged and be recorded for review. This is a behavior change from conservative per-image handling and can block otherwise usable chapters.
- SuggestedFix: Keep nonzero exit only for truly fatal command/setup failures, or gate strict review/error failure behind an explicit `--strict`/CI option. At minimum, do not fail on `review` decisions in the normal guided flow.
- Status: accepted
- Triage: Accepted. This conflicts with the conservative failure behavior in `asimov/specs/image-translation/spec.md`; normal runs should preserve original refs and report review/error counts without aborting the guided pipeline. Fixed by making review/error failure opt-in via `--strict`.

### S1
- ID: S1
- Severity: SUGGEST
- Confidence: HIGH
- Priority: P4
- Agent: chair
- File: `agents/agent-translate/scripts/translate-images.js:26`
- Title: Missing `--renderer` value silently falls back to overlay
- Evidence: `parseArgs` sets `renderer = args[i + 1]` and increments `i`; when `--renderer` is the last argument the value is `undefined`, so `createRendererOptions({ renderer })` defaults to `overlay` rather than rejecting.
- Impact: A typo such as `--renderer` without a value is accepted as a successful overlay run, which is surprising for an option whose accepted values are explicitly constrained.
- SuggestedFix: Treat `--renderer` with no following value, or a following flag, as an invalid renderer and fail before processing with the accepted values.
- Status: accepted
- Triage: Accepted. The renderer contract in `asimov/changes/add-image-edit-renderer/specs/image-translation/spec.md` requires exactly `overlay` or `image-edit`, so missing `--renderer` values must fail before processing. Fixed by validating missing or empty renderer values in argument parsing.

## Notes

- Chair self-review completed across the full diff.
- Specialist spawning was attempted in parallel but the runtime returned `Subagent depth limit reached (1)` for each requested specialist.
- `node --check` passed for changed JS/MJS files.
