# Proposal: add-image-edit-renderer

## Why

The current image translation flow can only render OCR translations as local overlays. Some textbook diagrams, screenshots, charts, and labeled illustrations may benefit from OpenAI image editing, but the flow must remain conservative so OCR-positive photos and natural images are not modified.

## Appetite

M (<=3d)

## Scope

### In scope
- Add an `image-edit` renderer to the existing image translation pass while keeping `overlay` as the default and fallback renderer.
- Keep OCR detection before renderer-specific work and add image type classification that skips real-life photos/natural images even when OCR finds text.
- Add `--renderer overlay|image-edit` to the image translation CLI and guided renderer selection to `cyberkbooks` interactive translation flow.
- Add `IMAGE_TRANSLATION_IMAGE_MODEL` config with default `gpt-image-2`.
- For eligible `image-edit` images, call OpenAI `/v1/images/edits`, write `assets/translated/*.vi.png`, update HTML `img src`, and record renderer/model/classification in the JSON sidecar.
- Preserve conservative behavior for missing assets, OCR/render/API failures, and retry transient image edit API failures.
- Verify on the existing fixture image flow and one real chapter.

### Out of scope
- Replacing the existing OCR overlay renderer as the default behavior.
- Adding a manual image review UI or human approval queue.
- Translating real-life photos, decorative photos, or natural images with incidental OCR text.
- Reworking DOCX/static export beyond preserving valid relative asset paths from rewritten HTML.

## Capabilities

1. **Image renderer selection** — Users can choose `overlay` or `image-edit` from CLI/guided flow, with `overlay` remaining default/fallback.
2. **Eligible image classification** — The image pass records text-bearing image type classification and gates translation to diagrams, tables, charts, statistics, screenshots, and labeled illustrations.
3. **OpenAI image edit rendering** — Eligible images can be translated through `/v1/images/edits`, saved as `.vi.png`, and referenced from HTML only after success.
4. **Image translation audit metadata** — Sidecars record renderer, model, classification, decisions, retries, outputs, and skip/error reasons.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** NOT REQUIRED
- **Justification**: The visible surface is a CLI/guided prompt change, not a browser UI. Verification should be integration/manual CLI runs on the fixture and one real chapter because the flow depends on local assets and OpenAI credentials.

## Risk Level

MEDIUM — the change adds an external image edit API path and generated binary asset outputs, but risk is bounded by opt-in renderer selection, conservative classification, sidecar audit data, and unchanged overlay default behavior.
