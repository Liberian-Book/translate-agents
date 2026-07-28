---
labels: [cli, image-translation, rendering, classification, fallback]
source: add-image-edit-renderer
summary: Image translation now defaults to image-edit, while overlay remains available explicitly and as fallback. The classifier uses a positive eligibility list so OCR-positive photos, natural images, and unknowns stay skipped instead of being auto-edited.
updated: 2026-07-27
---
# Image-edit renderer is the default; overlay remains explicit and fallback
**Date**: 2026-07-27

Image translation now defaults to image-edit for both guided and direct image translation runs. Overlay remains available through `--renderer overlay` and as fallback when image-edit cannot produce output safely. The classifier uses a positive eligibility list so OCR-positive photos, natural images, and unknowns stay skipped instead of being auto-edited.
