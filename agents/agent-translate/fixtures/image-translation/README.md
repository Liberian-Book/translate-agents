# Image Translation Fixture

Run from the repo root:

```bash
node agents/agent-translate/scripts/translate-images.js agents/agent-translate/fixtures/image-translation/diagram.html
node agents/agent-translate/scripts/translate-images.js agents/agent-translate/fixtures/image-translation/diagram.html --retranslate --renderer overlay
node agents/agent-translate/scripts/translate-images.js agents/agent-translate/fixtures/image-translation/diagram.html --retranslate --renderer image-edit
```

Expected result:

- `assets/translated/diagram.image-translation.json` records `decision: "auto"`, `renderer: "overlay"`, and an eligible `classification` such as `diagram`.
- `assets/translated/diagram.vi.png` is generated.
- `diagram.html` rewrites the diagram image `src` to `./assets/translated/diagram.vi.png`.
- `assets/translated/photo-like.image-translation.json` records `decision: "skip"`, `renderer: "overlay"`, and an ineligible `classification`.
- The photo-like image `src` remains `assets/photo-like.png`.

This fixture uses common stakeholder labels covered by the built-in fallback dictionary, so it can run without `OPENAI_API_KEY`. Production use should set `OPENAI_API_KEY` for labels outside the fallback dictionary.

Image-edit verification with `OPENAI_API_KEY` available:

- Fixture command: `node agents/agent-translate/scripts/translate-images.js agents/agent-translate/fixtures/image-translation/diagram.html --retranslate --renderer image-edit`
- Observed result: `auto=1, skip=1, review=0, error=0`; `assets/translated/diagram.image-translation.json` records `renderer: "image-edit"`, `model: "gpt-image-2"`, eligible `classification`, and `retries`.
- Real chapter command: `node agents/agent-translate/scripts/translate-images.js data/entrepreneurship/translated/1-2-entrepreneurial-vision-and-goals.html entrepreneurship --renderer image-edit`
- Observed result: initial image-edit verification generated `data/entrepreneurship/assets/translated/img-1-2-2.vi.png` and `data/entrepreneurship/assets/translated/img-1-2-3.vi.png`, and the HTML references those translated assets with valid relative `../assets/translated/*.vi.png` paths. A later non-strict rerun after those outputs existed reported `auto=0, skip=2, review=1, error=0`, printed a warning for the review item, and exited successfully; adding `--strict` exits nonzero for the same review item.
- A broader chapter-number run (`1 entrepreneurship --renderer image-edit`) expanded to 10 chapter-1 HTML files and was stopped after the first file exceeded the local timeout; use single-file verification for controlled image-edit runs.

Compatibility notes:

- The rewritten path stays relative to the HTML file, so existing static-site copy/build behavior can carry the referenced translated asset with the HTML tree.
- The planned `agents/agent-export/scripts/export-docx.js` file is not present in this checkout, so DOCX compatibility is limited to preserving ordinary relative `<img src>` paths.
