# Review: add-reader-book-page (Round 1)

- Date: 2026-08-11
- Reviewable lines: 952 (plus 44 test lines reviewed inline)
- Note: Large change — accuracy may decrease
- Agents spawned: none (runtime subagent depth limit prevented specialist spawning)
- Agents skipped: data-security, contracts (no assigned data/API/schema hunks); frontend/logic/performance attempted but not available in this isolated context
- Verdict: WARN
- Counts: BLOCK 0 | WARN 1 | SUGGEST 0

## Findings

### W1

- ID: W1
- Severity: WARN
- Confidence: HIGH
- Priority: P3
- Agent: chair
- File: `agents/agent-archive/book-reader/book-reader.css:403`
- Title: Closed mobile TOC remains in keyboard navigation
- Evidence: Mobile CSS only moves `#br-toc-sidebar` off-canvas with `transform: translateX(-105%)` while leaving the nav and all `.br-toc-link` anchors visible to the accessibility tree/tab order. The toggle handler in `book-reader.js:65-69` only changes `body.br-toc-open`, `aria-expanded`, and button text; it does not add `hidden`, `inert`, `aria-hidden`, or manage link `tabindex` while closed.
- Impact: On mobile, keyboard and screen-reader users can tab into or encounter offscreen TOC links while the control reports `aria-expanded="false"`, which violates the intended accessible mobile TOC behavior and can make navigation confusing.
- SuggestedFix: When the drawer is closed, remove the TOC from sequential focus/accessibility (`inert` plus appropriate fallback, or set `hidden`/`aria-hidden` and restore on open; alternatively set links to `tabindex="-1"` while closed). Keep `aria-expanded` synchronized, and add an E2E/accessibility assertion for closed-drawer focus behavior.
- Status: accepted
- Triage: Accepted. The mobile drawer's collapsed visual state must also remove TOC links from sequential focus and the accessibility tree to satisfy `specs/reader-book-page/spec.md` Mobile reader navigation and design.md D3 reader landmarks.

## Support code review

- Tests cover desktop TOC/content visibility, no `#br-right-panel`, current TOC after TOC navigation, and mobile toggle aria state/link navigation.
- No `.only`/`.skip` found in changed test hunks.
- Gap noted by W1: tests do not verify closed mobile drawer focusability/accessibility-tree state.

## Sub-agent attempts

- frontend: attempted; not-spawned due runtime subagent depth limit
- logic: attempted; not-spawned due runtime subagent depth limit
- performance: attempted; not-spawned due runtime subagent depth limit
- data-security: not-spawned (no data/security hunks)
- contracts: not-spawned (no API/schema/contract hunks)
