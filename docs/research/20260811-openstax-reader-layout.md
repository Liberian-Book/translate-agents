---
topic: openstax-reader-layout
created-by: research for change add-reader-book-page to mirror OpenStax reader UX without copying proprietary code
date: 2026-08-11
libraries: [openstax-reader]
used-by: [add-reader-book-page]
---

# Research: openstax-reader-layout

## Answers
- **Layout:** OpenStax reader pages use a sticky top navbar, a colored book banner, then a reader shell with a toolbar, a collapsible TOC/sidebar, and the main reading pane. On this page, the chapter outline is rendered near the top of the content, while the reader shell also exposes a dedicated TOC control and a sidebar width variable (`37.5rem`) for the left panel.
- **Responsive behavior:** Desktop uses a wide centered content area (`max-width: 128rem`) with separate desktop/mobile navbar and banner heights. Mobile switches to a hamburger menu (`Open menu`), reduced banner heights, and a `content-pane-wrapper--sidebar-closed-mobile` state; the TOC is not persistently open on small screens.
- **TOC/content interaction:** The TOC is driven by a button with `aria-controls="toc-sidebar"` and `aria-expanded` state. TOC entries are plain links with explicit `aria-label`s like “Go to Section 1.1…”. Bottom-of-page Previous/Next links provide linear navigation between pages.
- **Accessibility:** The page includes skip links, an accessibility-page link, a keyboard-shortcuts entry point, `aria-live="polite"` page-title confirmation, semantic headings, footnote semantics (`doc-noteref` / `doc-backlink`), image-enlarge buttons with descriptive `aria-label`s, and text alternatives for images. External citation and attribution info is surfaced in-page.
- **Implementation pattern for a generic app:** Use a sticky shell with a fixed top utility bar, a left TOC panel that collapses into a drawer on mobile, and a right content panel with a readable max width. Keep navigation state ARIA-complete, make TOC items real links, preserve keyboard access, and render book metadata/attribution outside the article body.

## Recommended Approach
- Build a two-pane reader with CSS grid/flex: left sidebar for TOC, right pane for translated content; collapse sidebar into a drawer below the desktop breakpoint.
- Make TOC state explicit (`aria-expanded`, `aria-controls`, focus trapping in drawer mode) and keep section navigation as semantic links.
- Include skip links, landmarks, readable heading hierarchy, footnote/backlink semantics, and image zoom affordances where needed.

## Confidence
- **High** — grounded in the public OpenStax page HTML/CSS structure and accessible attributes; responsive specifics are inferred from shipped markup and style variables.

## Gotchas & Constraints
- The public page’s visible chapter-outline block is not a literal persistent left rail in the SSR snapshot; the stronger signal for the reader shell is the toolbar/sidebar layout and mobile closed-sidebar state.
- The accessibility-statement/FAQ pages returned a JS-required shell via simple fetch, so deeper policy details were not directly inspectable here.
- This research avoids copying proprietary implementation details; it only extracts interaction and layout patterns.

## Gaps
- No live browser interaction was available, so hover/focus animations, exact breakpoint behavior, and drawer transitions were inferred rather than clicked through.
- Could not verify the full keyboard-shortcut map from the site UI.
