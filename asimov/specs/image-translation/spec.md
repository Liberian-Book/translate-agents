# image-translation Specification
## Requirements

### Requirement: Image Candidate Classification

The system SHALL classify each local image referenced by translated HTML as `skip`, `auto`, or `review` before rewriting any image reference.

#### Scenario: Real-life photo is skipped

- **WHEN** OCR finds no meaningful text regions or the text density is below the configured threshold for an image
- **THEN** the system MUST keep the original image reference unchanged and record a `skip` sidecar decision.

### Requirement: Translated Image Variant Output

The system SHALL write translated image variants under the same book data asset tree as the original image and MUST preserve the original image file unchanged.

#### Scenario: Auto-translated image reference

- **WHEN** an image is classified `auto` and a translated variant is generated successfully
- **THEN** the translated HTML MUST reference the translated variant using a relative URL valid from the HTML file location.

### Requirement: Image Translation Review Metadata

The system SHALL write a JSON sidecar for every processed image containing the source path, decision, OCR regions, translated text, confidence values, generated output path when present, and reason when skipped or queued for review.

### Requirement: Conservative Failure Behavior

The system MUST leave the existing translated HTML and original image references unchanged when OCR, translation, rendering, or path rewriting fails for an individual image.

### Requirement: Ambiguous Image Review

The system SHALL classify low-confidence OCR, overflow-prone translations, complex charts, equations, rotated text, and mixed photo-with-label images as `review` rather than `auto`.

