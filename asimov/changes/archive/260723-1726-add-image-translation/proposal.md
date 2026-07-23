# Proposal: add-image-translation

## Why

The translate agent currently translates book text but leaves image pixels unchanged, so diagrams and text-heavy table images can still contain English labels. The workflow needs to translate those image labels to Vietnamese while skipping real-life photos that do not need pixel-level translation.

## Appetite

M (≤3d)

## Scope

### In scope
- Add a local image-translation pass for already-downloaded book image assets.
- Classify images into skip, auto-translate, or manual-review candidates using OCR text density, OCR confidence, and simple file/metadata signals.
- Translate detected English text regions to Vietnamese and render translated overlay image variants for auto-safe diagrams/tables.
- Preserve original image files and write JSON sidecars for review/debugging.
- Update translated HTML image references only when a translated replacement asset is produced.
- Wire the image pass into the guided local translate flow before final upload.

### Out of scope
- Perfect recreation of complex charts, equations, rotated/curved labels, or photographic scenes with incidental text.
- Whole-image generative replacement.
- Full manual review UI; sidecar files and console/report output are sufficient for this change.
- Reworking scrape/cleanup asset storage beyond adding translated variants under the existing book data tree.

## Capabilities

1. **image-translation** — Detect, translate, render, and reference translated variants for text-bearing textbook images while leaving photos/originals intact.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** NOT REQUIRED
- **Justification**: Static book pages will show translated image variants for selected diagrams/tables, but this is generated content behavior verified more directly by script-level integration fixtures than browser E2E.

## Risk Level

MEDIUM — OCR quality, Vietnamese reflow, and asset path rewriting can produce visible content issues if confidence thresholds and review fallbacks are not conservative.
