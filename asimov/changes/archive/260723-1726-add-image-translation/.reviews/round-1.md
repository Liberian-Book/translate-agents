# Review: add-image-translation (Round 1)

- Date: 2026-07-24
- Reviewable lines: ~531
- Agents spawned/skipped: data-security/logic/contracts/performance attempted but runtime refused nested spawn (`Subagent depth limit reached`); frontend not spawned (no frontend files)
- Verdict: WARN
- Counts: BLOCK 0 | WARN 3 | SUGGEST 2

## Findings

### W1
- ID: W1
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:425`
- Title: Chapter-number target does not match translated filenames produced by the pipeline
- Evidence: `resolveTargets()` handles numeric targets by filtering `file.startsWith(`chapter-${target}-`)`, but the current flat pipeline writes translated files with the same filenames from `data/<book>/prep` (`translate.js` writes `path.join(translatedDir, file)`). Existing chapter counting in `interactive.mjs` uses `/^(\d+)-/`, and cleanup preserves OpenStax-style names such as `1-...` / `1-1-...`, not `chapter-1-...`.
- Impact: `node .../translate-images.js 1 <book>` and `cyberkbooks translate images <book> 1` can report no matches even when chapter 1 translated HTML exists, breaking one of the advertised target modes.
- SuggestedFix: Match the repo's actual flat filenames (for example `file === `${target}.html` || file.startsWith(`${target}-`)`) and, if still needed, separately support legacy `chapter-<N>/05-translated` layouts.
- Status: accepted
- Triage: Accepted. Numeric target mode is part of `design.md` CLI contract and must match current flat translated filenames.

### W2
- ID: W2
- Severity: WARN
- Confidence: HIGH
- Priority: P2
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:61`
- Title: HTML image paths can escape the intended book asset tree
- Evidence: `resolveImagePath()` accepts absolute paths as-is and resolves relative paths without checking the result against `data/<book>/assets` or even the HTML/book directory. `getTranslatedOutputPaths()` then writes sidecars/outputs next to the resolved image or under the first `assets` segment.
- Impact: A crafted or unexpected local HTML file can make the script read/process arbitrary local image paths and write generated sidecars/images outside the intended book data tree. In API mode, OCR text from those files can also be sent to the translation provider.
- SuggestedFix: Canonicalize with `fs.realpathSync`/`path.resolve` and reject any source image outside the expected book asset root(s). For direct-file fixture mode, require an explicit allowed root such as the HTML directory and reject absolute/path-traversal sources by default.
- Status: accepted
- Triage: Accepted. `design.md` Conservative Failure Behavior and Risk Map require local asset path rewriting without unsafe reads/writes outside expected roots.

### W3
- ID: W3
- Severity: WARN
- Confidence: HIGH
- Priority: P3
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:378`
- Title: Full-book runs redo OCR and API work for repeated image assets
- Evidence: `processHtmlFile()` calls `processImage()` for every `<img>` occurrence, and `translate-images.js` creates a new OCR worker per HTML file. There is no per-run cache keyed by `sourceImage`, no reuse of existing sidecars/outputs, and `translateRegions()` sends one sequential chat-completion request per OCR region.
- Impact: In `all` mode, shared assets referenced from multiple pages are OCRed, translated, and rendered repeatedly, increasing runtime and API cost along the book/page/image/region growth axis.
- SuggestedFix: Maintain a per-run `Map` by canonical source image path and reuse the first result for repeated references; skip or validate existing fresh sidecars/outputs; optionally batch all labels for one image in a single translation request and share one OCR worker across files.
- Status: accepted
- Triage: Accepted. `design.md` Risk Map calls out full-book growth axis; per-run source-image memoization and worker reuse are bounded mitigations.

### S1
- ID: S1
- Severity: SUGGEST
- Confidence: HIGH
- Priority: P4
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:381`
- Title: Remote/data/unresolvable images are silently omitted from sidecar reporting
- Evidence: `processHtmlFile()` does `if (!sourceImage) continue;`, so skipped remote/data/empty image references do not appear in `processed` summaries and no sidecar records the skip reason.
- Impact: The sidecar/review contract is less complete; reviewers cannot distinguish “no images” from “images intentionally ignored because they were remote/data URLs.”
- SuggestedFix: Add a skipped result record (and, where a safe sidecar path exists, sidecar metadata) with a reason like `remote-image`, `data-url`, or `empty-src`, without rewriting HTML.
- Status: accepted
- Triage: Accepted. `design.md D5` makes sidecar/review metadata the durable contract; skipped remote/data/empty refs should be visible in summaries.

### S2
- ID: S2
- Severity: SUGGEST
- Confidence: MEDIUM
- Priority: P4
- Agent: chair
- File: `agents/agent-translate/scripts/image-translation.js:218`
- Title: Translation API error bodies are persisted verbatim in sidecar reasons
- Evidence: `translateText()` throws `Translation API failed (${response.status}): ${body}`, and `processImage()` stores `error.message` as the sidecar `reason`.
- Impact: Provider error payloads can be large or include operational details from an OpenAI-compatible gateway, making generated review artifacts noisy and potentially sensitive.
- SuggestedFix: Store a bounded/sanitized reason such as status code plus short error code/message, and log detailed provider responses only when an explicit debug flag is set.
- Status: accepted
- Triage: Accepted. Conservative review artifacts should not persist full provider response bodies; bounded status-only reasons are sufficient.

## Support code review

- Fixture README and HTML contain no obvious secrets/PII.
- PNG fixtures were treated as support artifacts and not line-reviewed.
