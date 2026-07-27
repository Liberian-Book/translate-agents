# Review: add-image-edit-renderer (Round 2)

- Date: 2026-07-27
- Reviewable lines: 490
- Agents spawned/skipped: data-security skipped (runtime subagent depth limit), logic skipped (runtime subagent depth limit), contracts skipped (runtime subagent depth limit), frontend not-spawned (no frontend files), performance skipped (runtime subagent depth limit)
- Verdict: WARN
- Counts: BLOCK 0, WARN 1, SUGGEST 1

## Cross-round status

- Round 1 W1: fixed — normal image translation runs now warn on review/error counts and only fail with `--strict`.
- Round 1 S1: fixed — missing `--renderer` values now fail argument parsing before processing.

## Findings

### W1
- ID: W1
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:273`
- Title: OCR-positive unknown images default to eligible diagrams
- Evidence: `estimateStructuredType()` returns `{ type: 'diagram', eligible: true }` as its final fallback for any OCR-positive image that does not match the photo-like heuristic or earlier table/statistics/screenshot/chart heuristics. `classifyImage()` then auto-processes any eligible type when region count/confidence pass, so the fallback path can translate/edit images that were not clearly classified as one of the positive-list classes.
- Impact: This weakens the conservative gate required by the change: real-life/decorative/unknown OCR-positive images that do not satisfy `isPhotoLike()` can be treated as diagrams and sent to overlay or OpenAI image editing, despite the spec requiring only clearly diagram/table/chart/statistics/screenshot/labeled-illustration images to translate automatically and photos/natural/unknown images to remain unchanged.
- SuggestedFix: Make the final fallback `unknown` + ineligible or `review`, and only return eligible `diagram`/`labeled-illustration` when there is an explicit structural signal (for example clustered labels, arrows/lines, low entropy/vector-like features, or fixture-backed heuristics). Keep unknown OCR-positive images unchanged unless explicitly classified into the positive list.
- Status: accepted
- Triage: Accepted. The image classification spec requires a positive eligibility list and conservative skip behavior for photos/natural/unknown images. Fixed by making fallback OCR-positive images `unknown` and ineligible unless explicit vector-like/clustered structural signals classify them as diagrams.

### S1
- ID: S1
- Severity: SUGGEST
- Confidence: HIGH
- Priority: P4
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:9`
- Title: Overlay text model default changed outside the image-edit scope
- Evidence: The diff changes the OCR label translation default from `gpt-4o-mini` to `gpt-4o` (`DEFAULT_TEXT_MODEL`), while the design only adds `IMAGE_TRANSLATION_IMAGE_MODEL=gpt-image-2` and says the text translation model configuration remains separate and unchanged.
- Impact: Users who rely on the existing overlay default get a different, typically more expensive text model even when they do not opt into `image-edit`, which is an avoidable behavior/cost change outside this renderer feature.
- SuggestedFix: Keep the previous overlay text default unless there is a separate accepted requirement to change it; use only `IMAGE_TRANSLATION_IMAGE_MODEL` for the new image-edit renderer default.
- Status: accepted
- Triage: Accepted. The design says text translation model configuration remains separate and unchanged. Fixed by restoring the prior overlay text default to `gpt-4o-mini` and updating CLI help text.

## Notes

- Chair self-review completed across the full diff.
- Specialist spawning was attempted in parallel but the runtime returned `Subagent depth limit reached (1)` for each requested specialist.
- `node --check` passed for changed JS/MJS files.
