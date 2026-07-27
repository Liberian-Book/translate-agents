# image-translation Specification
## Requirements

### Requirement: Image Candidate Classification

The system SHALL classify each local image referenced by translated HTML with both a processing decision (`skip`, `auto`, or `review`) and an image type classification before rewriting any image reference. The system MUST only translate images classified as diagrams, tables, charts, statistics, screenshots, or labeled illustrations, and MUST skip real-life photos or natural images even when OCR detects text.

#### Scenario: Real-life photo with OCR text is skipped

- **WHEN** OCR finds text in an image classified as a real-life photo or natural image
- **THEN** the system MUST keep the original image reference unchanged and record a `skip` sidecar decision with the image type classification.

### Requirement: Translated Image Variant Output

The system SHALL write translated image variants under the same book data asset tree as the original image and MUST preserve the original image file unchanged.

#### Scenario: Auto-translated image reference

- **WHEN** an image is classified `auto` and a translated variant is generated successfully
- **THEN** the translated HTML MUST reference the translated variant using a relative URL valid from the HTML file location.

### Requirement: Image Translation Review Metadata

The system SHALL write a JSON sidecar for every processed image containing the source path, decision, image type classification, renderer, renderer model when applicable, OCR regions, translated text, confidence values, generated output path when present, retry summary when applicable, and reason when skipped, queued for review, or errored.

### Requirement: Conservative Failure Behavior

The system MUST leave the existing translated HTML and original image references unchanged when OCR, translation, rendering, or path rewriting fails for an individual image.

### Requirement: Ambiguous Image Review

The system SHALL classify low-confidence OCR, overflow-prone translations, complex charts, equations, rotated text, and mixed photo-with-label images as `review` rather than `auto`.

### Requirement: Image Renderer Selection

The system SHALL support an image translation renderer option with exactly `overlay` and `image-edit` values, and MUST default to `overlay` when no renderer is specified.

#### Scenario: Invalid renderer value

- **WHEN** the image translation command receives a renderer value other than `overlay` or `image-edit`
- **THEN** the system MUST fail before processing images and show the accepted renderer values.

### Requirement: Image Edit Renderer Configuration

The system SHALL read `IMAGE_TRANSLATION_IMAGE_MODEL` for the image edit renderer model and MUST use `gpt-image-2` when the variable is unset.

### Requirement: Image Edit Renderer Output

The system SHALL write successful image edit renderer outputs as PNG files under `assets/translated/` using a `.vi.png` suffix and MUST update the translated HTML image reference only after the PNG file is written successfully.

### Requirement: Image Edit Retry Behavior

The system SHALL retry OpenAI image edit requests for transient failures and MUST leave the original HTML image reference unchanged when all retry attempts fail and no overlay fallback output is generated successfully.

