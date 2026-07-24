# Discovery: add-image-translation

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search "translate image OCR diagram table Vietnamese assets"` |
| Existing Specs/Docs | Done | direct read of existing specs and research index |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| External Research | Done | librarian subagent, persisted to `docs/research/20260723-image-translation.md` |
| Constraint Check | Done | direct read of `package.json` and `bun.lock` |

## Key Findings

### 1. Current translation pipeline is HTML-text focused

The core translate flow is concentrated in `agents/agent-translate/scripts/translate.js#L214-L444`, where prepared HTML fragments are translated with OpenAI chat completions and written into translated chapter output. `agents/agent-translate/scripts/prep_html.js#L5-L98` creates bilingual HTML blocks, but the discovered flow does not include image OCR, image classification, translated asset generation, or image-specific review metadata.

### 2. Images are already scraped and rewritten as local assets

`agents/agent-scrape/scripts/skill-cleanup.js#L31-L142` downloads images and rewrites `<img>` references into local assets. That gives the image translation feature a stable integration point: operate after cleanup/prep on local image paths and replace only selected translated HTML image references with translated variants.

### 3. CLI flow can host a new image translation step

The guided flow runs through `src/cli/interactive.mjs#L99-L206`, with script wrappers in `src/cli/commands/*.mjs` and path helpers in `src/cli/lib/paths.mjs#L6-L21`. A new optional or automatic image step can be inserted after local assets exist and before final translated output/upload, while preserving existing local-output-before-upload behavior from `asimov/specs/translate-flow-upload/spec.md`.

### 4. Existing dependencies do not include OCR or image compositing

Root dependencies include `axios`, `cheerio`, `puppeteer`, and `html-to-docx`, with transitive `image-size` and `image-to-base64` from DOCX export. There is no direct OCR library, image compositor, or Python image stack declared. Any automated redraw path likely introduces a new runtime dependency and must be planned explicitly.

### 5. Research favors deterministic OCR plus local overlay, not whole-image regeneration

`docs/research/20260723-image-translation.md` recommends OCR/text-region detection plus local redraw/overlay for diagrams and tables. It warns that multimodal full-image regeneration can hallucinate or drift from source geometry. Manual review should catch low-confidence OCR, equations, charts, rotated text, mixed photo+text figures, and Vietnamese overflow.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Image asset source | Local image downloads and rewritten `<img>` paths from cleanup | Traverse translated/prepared HTML images and resolve local assets | No image selection pass exists |
| Image classification | None found | Distinguish real-life photos/decorative images from diagrams/tables/text-heavy images | Need classifier heuristics and metadata sidecar |
| OCR/extraction | None found | Detect English text regions with confidence and bounding boxes | New OCR stack required |
| Translation reuse | Text translation OpenAI pattern in `translate.js` | Translate OCR text snippets to Vietnamese with glossary-aware behavior where relevant | Need image-specific prompt/batching and error handling |
| Rendering | Existing HTML/DOCX export consumes image files | Generate translated replacement images preserving layout enough for textbook use | Need compositor/redraw implementation and font strategy |
| Review | HTML review flow is text-oriented | Queue ambiguous/low-confidence images for manual review without blocking clear skips/overlays | Need JSON/Markdown sidecar and status conventions |
| Upload/export | Existing static/R2 behavior uploads local book assets | Include translated image variants through existing asset references | Need ensure generated assets remain under book data and relative URLs stay valid |

## Options

### Option A — Metadata-only image handling

Translate figure captions, alt text, and surrounding text while leaving image pixels unchanged. This is the smallest implementation, but it fails the user's core requirement for diagrams/tables with visible English labels.

### Option B — OCR plus translated overlay with manual review queue (Recommended)

Add an image translation pass that classifies local images, skips likely real-life photos, OCRs text-bearing diagrams/tables, translates detected text snippets, writes translated asset variants plus JSON review sidecars, and updates translated HTML references only when a generated replacement is accepted/auto-safe. This best matches the requirement while limiting hallucination and preserving existing pipeline structure.

### Option C — Multimodal LLM generates replacement images

Use a multimodal model to classify, translate, and generate a full replacement image. This may handle hard layouts, but it is risky for textbook accuracy because geometry, labels, and table contents can drift or hallucinate.

### Option D — Manual-only image translation queue

Detect candidate images and produce a review/edit queue without automatic overlays. This is safer than generation but does not deliver a useful automated first pass and still leaves most work to humans.

## Risks

1. **Vietnamese text overflow breaks diagrams or tables** — translated text is often longer; mitigate with region-aware wrapping, font-size reduction limits, and send overflow cases to review instead of auto-applying.
2. **False positive photo translation** — photos with incidental text may be modified unnecessarily; mitigate with text-density thresholds and default skip for low OCR density/confidence.
3. **False negative diagram skip** — diagrams with small or stylized text may remain English; mitigate with review report listing skipped images with OCR stats and captions.
4. **New dependency weight and setup failures** — OCR/compositing dependencies can be heavy; mitigate by isolating the image step behind a script with clear installation/verification and narrow sample tests.
5. **Export/upload path regressions** — generated image paths must remain under book data and use relative URLs compatible with static site and DOCX export; mitigate by preserving original assets and only rewriting HTML to sibling translated assets.
