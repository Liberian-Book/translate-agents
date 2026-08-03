# Proposal: add-chapter-selection-to-translate-flow

## Why

The guided OpenStax translation flow should let the user decide whether to translate the full scraped book or only selected chapters once local chapter files are available. The current flow has most of this behavior, but the all-chapters choice can override specific chapter selections in a surprising way and the behavior is not captured as a supported contract.

## Appetite

S (<=1d)

## Scope

### In scope

- Keep chapter selection in the existing interactive OpenStax book translation pipeline after scrape and cleanup.
- Offer an explicit all-chapters option and per-chapter options derived from cleaned HTML files.
- Normalize checkbox results so choosing specific chapters is respected and the all-chapters option remains available.
- Preserve downstream scoping for term extraction, prep, text translation, and image translation.
- Keep guided image translation non-blocking when the image script reports review items, relying on its warning output and preserved original image references.
- Detect existing scraped raw book data in the guided flow and ask whether to skip scraping or scrape again.
- Reduce cleanup step terminal noise by showing a compact progress indicator instead of one log line per image/file.
- Detect existing cleaned book HTML in the guided flow and ask whether to skip cleanup or run cleanup again.
- Keep guided pipeline step output compact by capturing child script logs during normal operation and only surfacing detailed logs on failure or concise image review summaries.

### Out of scope

- Adding multi-chapter arguments to direct `cyberkbooks translate text` commands.
- Selecting chapters before scraping/cleanup produces local clean HTML files.
- Pruning previously translated chapters from `data/<book>/translated`, built site output, or R2.
- Changing scrape, OpenStax search, translation model, image translation renderer, build, or upload behavior beyond the guided-flow controls and compact progress/logging listed in scope.
- Skipping term extraction, translation, build, or upload when only scraped/cleaned local data exists.

## Capabilities

1. **guided-chapter-selection** — The guided book translation flow lets users translate all chapters or a selected subset after scrape/cleanup discovers chapter files.

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** NOT REQUIRED
- **Justification**: This is terminal prompt behavior in a long-running network/API pipeline without an existing prompt automation harness. Verification should use syntax checks and a narrow manual prompt smoke check rather than full OpenStax scrape/translation E2E.

## Risk Level

LOW — the change is localized to the interactive CLI prompt and reuses existing chapter file helpers and downstream script calls.
