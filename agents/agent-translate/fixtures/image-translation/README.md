# Image Translation Fixture

Run from the repo root:

```bash
node agents/agent-translate/scripts/translate-images.js agents/agent-translate/fixtures/image-translation/diagram.html
```

Expected result:

- `assets/translated/diagram.image-translation.json` records `decision: "auto"`.
- `assets/translated/diagram.vi.png` is generated.
- `diagram.html` rewrites the diagram image `src` to `./assets/translated/diagram.vi.png`.
- `assets/translated/photo-like.image-translation.json` records `decision: "skip"`.
- The photo-like image `src` remains `assets/photo-like.png`.

This fixture uses common stakeholder labels covered by the built-in fallback dictionary, so it can run without `OPENAI_API_KEY`. Production use should set `OPENAI_API_KEY` for labels outside the fallback dictionary.

Compatibility notes:

- The rewritten path stays relative to the HTML file, so existing static-site copy/build behavior can carry the referenced translated asset with the HTML tree.
- The planned `agents/agent-export/scripts/export-docx.js` file is not present in this checkout, so DOCX compatibility is limited to preserving ordinary relative `<img src>` paths.
