---
labels: [cli, image-translation, rendering, classification, fallback]
source: add-image-edit-renderer
summary: add-image-edit-renderer keeps OCR overlay as the default path. The image-edit renderer is opt-in via renderer=image-edit and the guided prompt, and the classifier now uses a positive eligibility list so OCR-positive photos, natural images, and unknowns stay skipped instead of being auto-edited.
updated: 2026-07-27
---
# Image-edit renderer is opt-in; overlay stays default and fallback
**Date**: 2026-07-27

add-image-edit-renderer keeps OCR overlay as the default path. The image-edit renderer is opt-in via renderer=image-edit and the guided prompt, and the classifier now uses a positive eligibility list so OCR-positive photos, natural images, and unknowns stay skipped instead of being auto-edited.
