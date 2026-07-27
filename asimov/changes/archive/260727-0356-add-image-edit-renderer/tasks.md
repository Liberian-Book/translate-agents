## 1. Renderer Core

- [x] 1_1 Add renderer option parsing and config plumbing
  - **Deps**: none
  - **Refs**: specs/image-translation/spec.md#requirement-image-renderer-selection; specs/image-translation/spec.md#requirement-image-edit-renderer-configuration; design.md D1; design.md D4
  - **Scope**: `agents/agent-translate/scripts/translate-images.js`, `agents/agent-translate/scripts/image-translation.js`, `src/cli/commands/translate.mjs`
  - **Acceptance**:
    - Outcome: CLI image translation accepts `--renderer overlay|image-edit`, defaults to `overlay`, rejects invalid renderers before processing, and passes the selected renderer plus `IMAGE_TRANSLATION_IMAGE_MODEL` into image processing.
    - Verify: integration `agents/agent-translate/scripts/translate-images.js`
  - **Plan**:
    1. Extend script argument parsing to extract `--renderer` without breaking existing `<target> [bookName]` usage.
    2. Validate renderer against `overlay` and `image-edit`; print accepted values on invalid input.
    3. Pass renderer/model options into the image processing entry point and command wrapper.
    4. Keep `overlay` as the default for omitted CLI and command options.

- [x] 1_2 Add image type classification and sidecar metadata
  - **Deps**: 1_1
  - **Refs**: specs/image-translation/spec.md#requirement-image-candidate-classification; specs/image-translation/spec.md#requirement-image-translation-review-metadata; design.md D2; design.md D3; design.md D5; docs/research/20260723-image-translation.md
  - **Scope**: `agents/agent-translate/scripts/image-translation.js`, `agents/agent-translate/fixtures/image-translation/README.md`, `agents/agent-translate/fixtures/image-translation/assets/translated/diagram.image-translation.json`, `agents/agent-translate/fixtures/image-translation/assets/translated/photo-like.image-translation.json`
  - **Acceptance**:
    - Outcome: Every processed image sidecar records renderer and classification; OCR-positive photos/natural images are skipped; eligible classes are limited to diagrams, tables, charts, statistics, screenshots, and labeled illustrations.
    - Verify: integration `agents/agent-translate/scripts/translate-images.js`
  - **Plan**:
    1. Refactor the existing classifier to return processing decision plus image type classification and eligibility reason.
    2. Use a positive eligible list for automatic translation and explicit skip rules for photos/natural images.
    3. Preserve existing review behavior for ambiguous/low-confidence cases.
    4. Extend sidecar writing to include renderer, classification, model when known, and missing asset skip/error reasons.
    5. Update fixture README expected sidecar fields.

- [x] 1_3 Implement the image-edit renderer
  - **Deps**: 1_2
  - **Refs**: specs/image-translation/spec.md#requirement-image-edit-renderer-output; specs/image-translation/spec.md#requirement-image-edit-retry-behavior; design.md D1; design.md D4; design.md D5; docs/research/20260727-openai-image-edits.md
  - **Scope**: `agents/agent-translate/scripts/image-translation.js`
  - **Acceptance**:
    - Outcome: Eligible images processed with `--renderer image-edit` call OpenAI `/v1/images/edits`, save successful output to `assets/translated/*.vi.png`, update HTML only after success, and record retry/model details in sidecars.
    - Verify: integration `agents/agent-translate/scripts/translate-images.js`
  - **Plan**:
    1. Build a preserve-layout image edit prompt from OCR text, translated Vietnamese text, and image classification.
    2. Send multipart image edit requests to `/v1/images/edits` using the existing OpenAI API key/config style.
    3. Decode `b64_json` output for GPT image models and write deterministic `.vi.png` files under `assets/translated/`.
    4. Retry transient 408/409/429/5xx/network failures with bounded attempts; do not retry validation/model errors.
    5. On final image-edit failure, record an error/fallback sidecar and use overlay fallback only when the existing overlay path can complete safely.

## 2. Guided Flow

- [x] 2_1 Add interactive renderer selection to cyberkbooks
  - **Deps**: 1_1
  - **Refs**: specs/image-translation/spec.md#requirement-image-renderer-selection; design.md D1; design.md Interfaces; asimov/specs/translate-flow-upload/spec.md
  - **Scope**: `src/cli/interactive.mjs`
  - **Acceptance**:
    - Outcome: The guided translate flow asks which image renderer to use before the image translation step, defaults to overlay, and passes the choice into the same image translation command used by manual CLI runs.
    - Verify: integration `src/cli/interactive.mjs`
  - **Plan**:
    1. Add a renderer prompt near the existing image translation step with `overlay` first/default and `image-edit` second.
    2. Pass the selected renderer into the image translation invocation without changing text translation or final upload ordering.
    3. Keep non-image rerun paths compatible with the default renderer.

## 3. Verification

- [x] 3_1 Verify fixture and one real chapter
  - **Deps**: 1_3, 2_1
  - **Refs**: specs/image-translation/spec.md; design.md D5; design.md Risk Map; asimov/specs/static-book-output/spec.md
  - **Scope**: `agents/agent-translate/fixtures/image-translation/README.md`, `agents/agent-translate/fixtures/image-translation/diagram.html`, `agents/agent-translate/fixtures/image-translation/assets/translated/diagram.image-translation.json`, `agents/agent-translate/fixtures/image-translation/assets/translated/photo-like.image-translation.json`
  - **Acceptance**:
    - Outcome: Fixture documentation records successful `overlay` default behavior, `image-edit` behavior on a fixture image, and a one-chapter real-book verification command/result with original assets preserved and translated `.vi.png` references valid.
    - Verify: manual `run fixture image translation and one real chapter image translation`
  - **Plan**:
    1. Run the fixture with default overlay and confirm existing expected sidecar/rewrite behavior still passes.
    2. Run the fixture with `--renderer image-edit` when OpenAI credentials are available and confirm `.vi.png`, HTML rewrite, and sidecar renderer/model/classification.
    3. Run one real chapter, preferably `node agents/agent-translate/scripts/translate-images.js 1 entrepreneurship --renderer image-edit`, and record summary counts plus any skipped missing assets.
    4. Update the fixture README with exact commands, expected output paths, and any credential-dependent skip note.
