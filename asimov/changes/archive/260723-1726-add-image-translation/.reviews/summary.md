# Review Summary: add-image-translation

## Round 1 — 2026-07-24

- Verdict: WARN
- BLOCK: 0 | WARN: 3 | SUGGEST: 2
- Open findings: W1, W2, W3, S1, S2

### Lifecycle

| ID | Status | Severity | File | Title |
|---|---|---|---|---|
| W1 | open | WARN | `agents/agent-translate/scripts/image-translation.js:425` | Chapter-number target does not match translated filenames produced by the pipeline |
| W2 | open | WARN | `agents/agent-translate/scripts/image-translation.js:61` | HTML image paths can escape the intended book asset tree |
| W3 | open | WARN | `agents/agent-translate/scripts/image-translation.js:378` | Full-book runs redo OCR and API work for repeated image assets |
| S1 | open | SUGGEST | `agents/agent-translate/scripts/image-translation.js:381` | Remote/data/unresolvable images are silently omitted from sidecar reporting |
| S2 | open | SUGGEST | `agents/agent-translate/scripts/image-translation.js:218` | Translation API error bodies are persisted verbatim in sidecar reasons |
