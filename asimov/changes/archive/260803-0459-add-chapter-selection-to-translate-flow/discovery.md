# Discovery: add-chapter-selection-to-translate-flow

## Workstreams

| Workstream | Status | Method |
|---|---|---|
| Memory Recall | Done | `bun run asm memory search "chapter selection translate flow OpenStax CLI interactive"` |
| Architecture Snapshot | Done | finder subagent |
| Internal Patterns | Done | finder subagent |
| Existing Design/Plan Docs | Done | direct read of existing specs and CLI research |
| External Research | Skipped | no new library/API/domain required |
| Constraint Check | Done | existing specs and CLI prompt conventions |

## Key Findings

### 1. The guided OpenStax translate pipeline already has the right insertion point

The no-argument CLI path launches `src/cli/interactive.mjs`, searches OpenStax books, lets the user select a book, then runs scrape, cleanup, terms, prep, text translation, image translation, build, and upload. Finder reported the guided pipeline in `src/cli/interactive.mjs#L126-L237`, with scraping and cleanup before chapter selection. This matches the requested timing: the CLI can only know available chapter files after OpenStax data has been scraped and cleaned.

### 2. Chapter selection helpers already exist but need to become intentional contract

Finder reported existing chapter helpers in `src/cli/interactive.mjs#L288-L340`: `selectChaptersForTranslation`, `listCleanChapters`, `listChapterHtmlFiles`, and filename parsing via leading chapter numbers. The checkbox includes an all sentinel and maps detected clean HTML files to chapter choices. The pipeline uses the selected chapters for term extraction, prep, text translation, and image translation.

### 3. Command/script support is asymmetric

Image translation and term extraction already support chapter numbers or `all`, while text translation only accepts `bookName` plus an optional single HTML file. The guided flow works around this by iterating chapter HTML files. `prep_html.js` supports either a whole book or one input/output file, so the guided flow also iterates selected files for partial prep.

### 4. Existing prompt convention should be reused

The repo uses `@inquirer/prompts` named imports with centralized cancellation handling in `src/cli/interactive.mjs#L4-L38`. Prior CLI research in `docs/research/20260717-node-cli-stack.md` recommends this same pattern. The change should keep the prompt inside the existing interactive flow and avoid a new dependency.

## Gap Analysis

| Component | Have | Need | Gap |
|---|---|---|---|
| Guided book translation | Prompt-driven OpenStax book selection and scrape/cleanup pipeline | Supported option after scraped data to choose all chapters or specific chapters | Existing implementation is present but not captured in spec/tasks and may need UX tightening |
| Chapter choice UX | Checkbox with `Tất cả chương` checked by default plus per-chapter choices | User can intentionally choose all chapters or one/more specific chapters | If all remains selected alongside specific chapters, all wins; this can surprise users |
| Partial pipeline application | Selected chapters drive terms, prep, translate text, translate images | Every downstream step respects the same selected chapter set | Existing guided flow does this; builder should verify and keep it intact |
| Direct CLI commands | `translate text` accepts all or one HTML file; image command accepts chapter/all | No direct command change required by user request | Adding direct multi-chapter command support would expand scope |
| Validation | No repo-wide tests/lint | Narrow verification of changed CLI module and a no-network helper-level check where possible | Need realistic verification that avoids scraping OpenStax during plan/build |

## Options

### Option A — Spec and tighten the existing guided checkbox behavior (Recommended)

Keep the feature in the no-argument interactive flow after cleanup. Ensure the prompt offers an explicit all-chapters option and specific chapter options, and make selected specific chapters take effect without accidental all-chapter override. This is smallest because it works with current helpers and downstream script capabilities.

### Option B — Add direct CLI chapter arguments to `cyberkbooks translate text`

Extend the direct command to accept one or more chapter numbers and translate matching files. This improves non-interactive automation but is outside the requested “when choosing a book” interactive flow and requires changes to command contracts.

### Option C — Move chapter selection before scraping

Try to choose chapters from OpenStax metadata before scrape/cleanup. This would be more complex and less reliable because the local clean file names are the current source of chapter grouping.

## Risks

1. **All sentinel ambiguity** — if `Tất cả chương` remains selected while users check specific chapters, the current behavior chooses all. Mitigate by making the prompt behavior explicit or normalizing selection so specific chapter choices can override the all sentinel.
2. **Filename parsing dependency** — chapter detection depends on clean HTML files starting with a chapter number. Mitigate by preserving the fallback to all when no chapters are detected.
3. **Partial book output expectations** — build/upload still process the local translated book folder, which may include previously translated chapters. Mitigate by documenting that chapter choice scopes the current pipeline work, not a prune of existing translated output.
