# Discovery: add-image-edit-renderer

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search` |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent plus archived image-translation plan artifacts |
| External Research | Done | librarian subagent; persisted to `docs/research/20260727-openai-image-edits.md` |
| Constraint Check | Done | direct read of existing `image-translation` spec and image translation research |

## Key Findings

### 1. Existing image translation is a conservative OCR overlay pass

The current flow scans translated HTML for local `<img>` references, resolves assets, runs OCR, classifies candidates, translates OCR text with the text model path, renders local overlays with `sharp`, writes sidecars, and rewrites HTML only after successful generated output. The core implementation lives in `agents/agent-translate/scripts/image-translation.js`, with CLI wiring in `agents/agent-translate/scripts/translate-images.js` and `src/cli/commands/translate.mjs`, plus guided-flow wiring in `src/cli/interactive.mjs`.

The existing specification already requires conservative classification, translated variants under the book asset tree, review metadata, and per-image failure isolation. The prior design intentionally chose OCR plus overlay as the default because it preserves layout and avoids full-image hallucination risk.

### 2. The requested renderer is additive, not a replacement

The requirements keep OCR detection and the OCR overlay renderer as fallback/default. The new image-edit renderer should therefore reuse OCR and existing candidate resolution, then add a renderer branch for eligible non-photo image types. The CLI and guided flow need renderer selection, but default behavior should remain `overlay` to preserve current automation behavior.

### 3. Classification needs a richer image type dimension

The current classifier is OCR-oriented and classifies decisions such as skip/auto/review. The new requirement needs image type classification before translating so OCR-positive real-life photos and natural images are skipped, while diagrams, tables, charts, statistics, screenshots, and labeled illustrations can proceed. Sidecars must record both decision and classification so review can explain why OCR text was ignored or translated.

### 4. OpenAI image edits use multipart uploads and base64 output

Research confirms `client.images.edit()` posts multipart input to `/v1/images/edits`. For Node, use `toFile(fs.createReadStream(...), name, { type })` or equivalent SDK uploadable input. GPT image models return `b64_json`, so the implementation should decode bytes and write `assets/translated/*.vi.png`; URL output should not be assumed for `gpt-image-2`.

`gpt-image-2` appears in current SDK types and OpenAI image guidance as an image editing model, but some inline SDK edit docs lag behind. The model must be configurable with `IMAGE_TRANSLATION_IMAGE_MODEL`, defaulting to `gpt-image-2` as requested.

### 5. Retry behavior should target transient API failures only

The OpenAI SDK already retries common transient failures by default, including 408, 409, 429, 5xx, network failures, and `AbortError`. The implementation still needs explicit per-image retry/fallback handling so an image edit failure records an error sidecar and leaves HTML unchanged. Validation/model errors should not be retried as if they were transient.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Renderer selection | Single implicit OCR overlay renderer | `--renderer overlay|image-edit` and guided renderer selection | Add option parsing and pass renderer through CLI/guided flow to core processing |
| OCR detection | Existing OCR worker and OCR-based classification | Keep OCR detection for text-bearing image discovery | Reuse OCR before any renderer-specific work |
| Image classification | Skip/auto/review heuristic | Eligible type classification: diagrams, tables, charts, statistics, screenshots, labeled illustrations; skip real-life/photos/natural images | Add classification result and policy gate before translation/rendering |
| Image edit renderer | None | Call OpenAI `/v1/images/edits`, save PNG output, rewrite HTML | Add image-edit branch with upload, prompt, output decode, retry/error sidecar |
| Config | Text model env/config only | `IMAGE_TRANSLATION_IMAGE_MODEL=gpt-image-2` | Add config lookup and sidecar recording |
| Sidecar | OCR, translations, decision, output/reason | Renderer, model, classification | Extend sidecar schema without removing existing review fields |
| Missing assets | Existing resolver may skip some unresolved images | Skip missing original assets safely | Ensure no crash and sidecar/summary records missing asset where possible |
| Verification | Fixture and existing README | Verify fixture image and one real chapter | Update fixture docs/tasks with concrete commands and expected checks |

## Options

### Option A — Image-edit replaces overlay for auto images

Route all auto-classified eligible images through OpenAI image edits and use overlay only when the API fails. This directly exercises the new renderer but changes default behavior and increases cost/hallucination risk for existing users.

### Option B — Renderer option with overlay default and image-edit opt-in (Recommended)

Add a renderer option that defaults to `overlay`, with `image-edit` as an explicit CLI/guided selection. This satisfies the new renderer requirement while preserving current conservative behavior and making overlay the fallback/default as requested.

### Option C — Hybrid renderer selected automatically by classification

Automatically use overlay for simple diagrams/tables and image-edit for screenshots/labeled illustrations. This could improve output quality later, but it requires more policy tuning than the current requirements demand and would make verification less deterministic.

## Risks

1. **Image-edit hallucination or layout drift** — Generated images can change non-text content; mitigate by keeping overlay as default, using strict prompts, limiting eligible classes, and leaving failures unchanged.
2. **OCR-positive photos get edited** — Photos with incidental signs/labels could be modified; mitigate with a classification gate that skips real-life/photos/natural images even when OCR finds text.
3. **API/model ambiguity** — `gpt-image-2` is current but docs are partly inconsistent; mitigate with `IMAGE_TRANSLATION_IMAGE_MODEL` config and sidecar model recording.
4. **Per-image failures corrupt HTML** — Missing assets, API failures, or decode errors could break output; mitigate by writing HTML only after generated PNG success and recording error sidecars while preserving original `src`.
5. **Cost/rate limits on all-book runs** — Growth axis is number of eligible images per selected target; mitigate with renderer opt-in, per-image retries, and narrow chapter/file verification before broader runs.
