## 1. Image Translation Core

- [x] 1_1 Add OCR/classification/render dependencies
  - **Deps**: none
  - **Refs**: specs/image-translation/spec.md; design.md D2; docs/research/20260723-image-translation.md
  - **Scope**: `package.json`, `bun.lock`
  - **Acceptance**:
    - Outcome: `tesseract.js` and `sharp` are installed as direct runtime dependencies for the image translation script.
    - Verify: integration `bun install`
  - **Plan**:
    1. Add `tesseract.js` and `sharp` to root dependencies with the package manager already used by the repo.

- [x] 1_2 Implement image translation processing script
  - **Deps**: 1_1
  - **Refs**: specs/image-translation/spec.md; design.md D1; design.md D2; design.md D3; design.md D4; design.md D5; docs/research/20260723-image-translation.md
  - **Scope**: `agents/agent-translate/scripts/translate-images.js`, `agents/agent-translate/scripts/image-translation.js`
  - **Acceptance**:
    - Outcome: Running the script for one translated HTML file processes local `<img>` references, writes sidecars for each resolved image, generates translated variants only for `auto` images, and never overwrites originals.
    - Verify: integration `agents/agent-translate/scripts/translate-images.js`
  - **Plan**:
    1. Implement argument resolution for file path, chapter number, and `all`, defaulting `bookName` to `entrepreneurship`.
    2. Resolve each HTML `<img src>` to a local asset path, skipping remote/data URLs with a sidecar reason.
    3. Use `tesseract.js` OCR output to compute text density, region confidence, and candidate regions.
    4. Translate OCR text snippets by reusing the existing translation request pattern from `translate.js` without changing text translation behavior.
    5. Render auto-safe translated overlays with `sharp`, write deterministic translated assets, and update HTML only after success.
    6. Write JSON sidecars for `skip`, `auto`, `review`, and `error` decisions.

- [x] 1_3 Add narrow fixture coverage for image decisions and path rewriting
  - **Deps**: 1_2
  - **Refs**: specs/image-translation/spec.md; design.md D3; design.md D4; design.md D5
  - **Scope**: `agents/agent-translate/fixtures/image-translation/diagram.html`, `agents/agent-translate/fixtures/image-translation/assets/diagram.png`, `agents/agent-translate/fixtures/image-translation/assets/photo-like.png`, `agents/agent-translate/fixtures/image-translation/README.md`
  - **Acceptance**:
    - Outcome: A documented fixture can demonstrate one auto-translated diagram/table-like image and one skipped photo-like image without needing a full book run.
    - Verify: manual `run translate-images.js on fixture and inspect generated sidecars plus rewritten diagram src`
  - **Plan**:
    1. Add minimal fixture HTML and small generated/static PNG assets suited to OCR classification.
    2. Document the exact local verification command and expected sidecar decisions in the fixture README.

## 2. Pipeline Integration

- [x] 2_1 Wire image translation into CLI commands and guided flow
  - **Deps**: 1_2
  - **Refs**: specs/image-translation/spec.md; design.md D1; asimov/specs/translate-flow-upload/spec.md
  - **Scope**: `package.json`, `src/cli/commands/translate.mjs`, `src/cli/interactive.mjs`, `src/cli/index.mjs`
  - **Acceptance**:
    - Outcome: The guided translate flow runs image translation after text translation and before final upload, while a script/command remains available for one file, one chapter, or all chapters.
    - Verify: integration `src/cli/interactive.mjs`
  - **Plan**:
    1. Add a package script or CLI command that invokes `agents/agent-translate/scripts/translate-images.js`.
    2. Insert the image step after translated HTML generation in the guided flow.
    3. Surface summary counts for `auto`, `skip`, `review`, and `error` without failing final upload unless the script itself exits fatally.

- [x] 2_2 Verify export/upload compatibility on a narrow translated HTML input
  - **Deps**: 2_1
  - **Refs**: specs/image-translation/spec.md; design.md D3; design.md Risk Map; asimov/specs/static-book-output/spec.md
  - **Scope**: `agents/agent-export/scripts/export-docx.js`, `scripts/build-site.mjs`, `agents/agent-translate/fixtures/image-translation/README.md`
  - **Acceptance**:
    - Outcome: Existing export/build code either needs no change or is minimally adjusted so translated image asset paths remain consumable by DOCX/static site output.
    - Verify: manual `run fixture through image translation, then inspect relative image paths expected by export/build`
  - **Plan**:
    1. Check whether generated relative image paths already work with export/build path handling.
    2. If path handling fails, make the smallest compatibility adjustment in the listed export/build file.
    3. Record the verified command and expected output in the fixture README.
