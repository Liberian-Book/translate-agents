---
topic: image-translation
created-by: research for change-id add-image-translation (textbook image translation pipeline for local automation)
date: 2026-07-23
libraries: ["tesseract.js", "pytesseract", "sharp", "PaddleOCR", "Pillow", "opencv-python"]
used-by: ["add-image-translation"]
---

# Research: image-translation

## Answers

- Best default for textbook diagrams and text-heavy tables: OCR + text-region detection + local redraw/overlay. It is deterministic, keeps assets local, and preserves layout better than re-generating the whole image.
- Best OCR stack for layout-aware Python scripting: `PaddleOCR` (detection + orientation + recognition) or `pytesseract.image_to_data()` when you want a simpler dependency chain. For Node-only pipelines, `tesseract.js` works but layout fidelity is weaker.
- Best rendering stack: Python `Pillow`/OpenCV for masks, fills, and text placement; Node `sharp` for compositing, metadata, resizing, and final image export. `sharp` text rendering is Pango-backed and good for local asset generation.
- For photos with no meaningful embedded text, skip translation by default. Use a lightweight classifier rule: low OCR text density + low confidence + photo-like content => keep original image.
- Use alt/caption/figure titles as metadata signals and fallback translation, not as a replacement for OCR when text is visible in the image.
- Keep manual review in the loop for ambiguous cases: tables, charts, equations, rotated text, mixed photo+text figures, and low-confidence OCR.

## Recommended Approach

- Use a 3-stage local pipeline:
  1. detect text regions and classify image type,
  2. translate only the text-bearing regions,
  3. render a replacement/overlay image plus a JSON sidecar for review.
- Prefer Python for OCR + redraw: `PaddleOCR` (or `pytesseract`) + `Pillow`/OpenCV. Use Node `sharp` only for final compositing/export if the existing asset pipeline is already Node-based.
- Write outputs as local assets the HTML/export already can reference, e.g. `assets/translated/<stem>.png` plus `assets/translated/<stem>.json` with OCR boxes, translations, confidence, and review status.

## Installation

```bash
# Node
npm i tesseract.js sharp

# Python
pip install paddleocr pytesseract pillow opencv-python
```

## Core API

### Node

```ts
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
```

- `worker.recognize(image, {}, { blocks: true })` returns nested layout with `blocks -> paragraphs -> lines -> words`, plus `bbox` and `confidence`.
- `worker.detect()` is available for orientation/script detection, but Tesseract.js requires legacy support flags for that path.
- `sharp().metadata()` reads image dimensions/format quickly.
- `sharp().composite([...])` overlays rendered text/masks/images onto a base image.

### Python

```python
import pytesseract
from pytesseract import Output
from PIL import Image, ImageDraw, ImageFont
from paddleocr import PaddleOCR
```

- `pytesseract.image_to_data(..., output_type=Output.DATAFRAME|DICT)` is the most useful layout-aware OCR output.
- `pytesseract.image_to_boxes()` is character-level only; useful for niche cases, not the main pipeline.
- `PaddleOCR` provides text detection boxes (`dt_polys` / `dt_boxes`), recognition text, confidence, and optional angle classification.

## Usage Examples

- `huggingface/transformers` uses `pytesseract.image_to_data(..., output_type="dict")` to collect words and bounding boxes for document models.
- `run-llama/ParseBench` uses `pytesseract.image_to_data(..., output_type=Output.DICT)` as a practical OCR post-processing pattern.
- `lovell/sharp` supports `composite()` and text/image creation for local redraw pipelines.
- PaddleOCR docs expose `PPDocTranslation` and `PPOCRLabel` for translation-oriented parsing and manual correction workflows.

## Platform-Specific Setup

- For Node pipelines, `sharp` is the most practical image compositor; use SVG/text overlays or pre-rendered text images for precise placement.
- For Python pipelines, `Pillow` is simplest for text drawing; OpenCV is better for masking/painting over source text regions.
- `PaddleOCR` is better than vanilla Tesseract when you need text detection, rotation handling, and table/diagram-heavy pages.

## Gotchas & Constraints

- Overlay translation is only as good as box detection. Long translated Vietnamese strings often need reflow, smaller fonts, or multi-line wrapping inside each detected region.
- Tables are the hardest case: keep grid lines, align cell-by-cell, and treat each cell as an independent redraw target when possible.
- Full-image regeneration from a multimodal LLM is visually risky for textbooks because it can drift from the original geometry and introduce hallucinated labels.
- OCR confidence alone is not enough to decide photo vs diagram; combine it with text coverage/region count and a simple visual heuristic.
- If the page contains equations, charts, or stylized labels, push it to manual review instead of fully automating.

## Tradeoff Summary

| Approach | Best for | Pros | Cons |
| --- | --- | --- | --- |
| (1) OCR extract + translated overlay | Diagrams, callouts, text-heavy tables | Local, deterministic, preserves layout best | Hard with reflow, rotation, tiny fonts, curved labels |
| (2) Multimodal LLM classify/translate + generated replacement | Mixed figures, low-quality scans, hard layouts | Can infer semantics when OCR fails | Slow/costly, hallucination risk, layout drift, harder to review |
| (3) Manual review queue | Ambiguous or high-value assets | Highest quality control, safest fallback | Human time required, slower throughput |
| (4) Existing alt/caption | Photos, figure titles, metadata-only translation | Cheap, fast, useful when no embedded text | Not enough for visible text inside the image |

## Recommended Decision Rules

- Auto-skip: real-life photos, decorative art, low text density, or OCR confidence below threshold.
- Auto-overlay: diagrams, schematics, screenshots, tables, and any image with clustered text boxes.
- Manual review: equations, mixed photo+label figures, complex charts, rotated/curved text, low-confidence OCR, or any image whose Vietnamese translation would overflow badly.
- Metadata-first: if alt/caption exists, translate that regardless; use it as the figure description even when the image itself is skipped.

## Gaps

- I did not verify a single off-the-shelf library that reliably redraws textbook figures/tables end-to-end with perfect Vietnamese layout preservation.
- I did not validate a specific Vietnamese font stack for the repo’s export targets; font choice will materially affect final readability and line wrapping.
- I did not inspect the local repo’s existing asset naming conventions, so the suggested `assets/translated/` path is a recommendation, not a confirmed convention.

## Confidence

Medium — confirmed against official docs for Tesseract.js, pytesseract, Sharp, PaddleOCR, plus real-world GitHub usage patterns for OCR post-processing and image compositing.
